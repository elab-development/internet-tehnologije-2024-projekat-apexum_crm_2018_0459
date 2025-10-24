<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    // SK6: Dodaj novog customera (filteruj korisnike po ulozi sales_rep)
    public function store(Request $request)
    {
        $this->ensureManager();

        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:customers,email',
            'phone'     => 'nullable|string|max:100',
            'website'   => 'nullable|string|max:255',
            'industry'  => 'nullable|string|max:255',
            'address'   => 'nullable|string|max:500',
            'image_url' => 'nullable|url',
            // vlasnik može biti samo sales_rep
            'owner_id'  => 'required|exists:users,id',
        ]);

        $owner = User::find($data['owner_id']);
        if ($owner->role !== User::ROLE_SALES_REP) {
            return response()->json(['message' => 'Vlasnik customera mora biti sales_rep.'], 422);
        }

        $customer = Customer::create($data);

        $customer->load(['owner', 'opportunities.owner', 'activities.owner', 'activities.opportunity']);

        return (new CustomerResource($customer))
                ->response()
                ->setStatusCode(201);
    }

    // SK7: Ažuriraj ownership po NAZIVU sales repa (PATCH)
    public function patchOwnership(Request $request, $customerId)
    {
        $this->ensureManager();

        $data = $request->validate([
            'sales_rep_name' => 'required|string',
        ]);

        $customer = Customer::findOrFail($customerId);

        $salesRep = User::where('name', $data['sales_rep_name'])
            ->where('role', User::ROLE_SALES_REP)
            ->first();

        if (! $salesRep) {
            return response()->json(['message' => 'Nije pronađen sales_rep sa datim imenom.'], 422);
        }

        $customer->update(['owner_id' => $salesRep->id]);

        $customer->load(['owner', 'opportunities.owner', 'activities.owner', 'activities.opportunity']);

        return new CustomerResource($customer);
    }

    // SK8: Pregled svih customera (kartice + filteri + paginacija)
    public function index(Request $request)
    {
        $this->ensureManager();

        $search  = $request->query('search');     // ime/email
        $repId   = $request->query('owner_id');   // filtriranje po sales_rep-u
        $perPage = (int)($request->query('per_page', 12));

        $q = Customer::query();

        if ($search) {
            $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($repId) {
            $q->where('owner_id', $repId);
        }

        $customers = $q->with(['owner'])->orderBy('name')->paginate($perPage);

        return CustomerResource::collection($customers);
    }

    // SK9: Vrati detalje jednog customera (show more details)
    public function show($id)
    {
        $this->ensureManager();

        $customer = Customer::with([
            'owner',
            'opportunities.owner',
            'activities.owner',
            'activities.opportunity',
        ])->findOrFail($id);

        return new CustomerResource($customer);
    }

    // SK10: Pregled metrika (primer: broj customers, broj opps, suma amount, broj aktivnosti)
    public function metrics()
    {
        $this->ensureManager();

        $data = [
            'customers_total'     => Customer::count(),
            'opportunities_total' => \App\Models\Opportunity::count(),
            'opportunities_sum'   => (float) \App\Models\Opportunity::sum('amount'),
            'activities_total'    => \App\Models\Activity::count(),
        ];

        return response()->json(['metrics' => $data]);
    }

    private function ensureManager(): void
    {
        if (Auth::user()?->role !== User::ROLE_MANAGER && Auth::user()?->role !== User::ROLE_ADMIN) {
            // Adminu dozvoljavamo uvid/operacije menadžera po potrebi
            abort(403, 'Dozvoljeno menadžeru ili adminu.');
        }
    }
}
