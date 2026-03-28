<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MyCustomersController extends Controller
{
    // SK11: Vrati MOJE customers sa svim opportunities i activities
    public function index(Request $request)
    {
        $this->ensureSalesRep();

        /** @var User $me */
        $me = Auth::user();

        $customers = Customer::with([
            'owner',
            'opportunities.owner',
            'activities.owner',
            'activities.opportunity',
        ])
        ->where('owner_id', $me->id)
        ->orderBy('name')
        ->paginate((int)$request->query('per_page', 12));

        return CustomerResource::collection($customers);
    }

    private function ensureSalesRep(): void
    {
        if (Auth::user()?->role !== User::ROLE_SALES_REP) {
            abort(403, 'Dozvoljeno samo prodavcima (sales_rep).');
        }
    }
}
