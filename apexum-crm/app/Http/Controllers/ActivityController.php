<?php

namespace App\Http\Controllers\SalesRep;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    // SK14: Dodaj nov activity
    public function store(Request $request)
    {
        $this->ensureSalesRep();

        $data = $request->validate([
            'customer_id'    => 'required|exists:customers,id',
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'type'           => 'required|in:call,email,meeting,task',
            'status'         => 'required|in:open,completed,cancelled',
            'subject'        => 'required|string|max:255',
            'due_at'         => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        // Validacija: ako je prosleđen opportunity, mora pripadati istom customeru
        if (! empty($data['opportunity_id'])) {
            $opp = Opportunity::findOrFail($data['opportunity_id']);
            if ((int)$opp->customer_id !== (int)$data['customer_id']) {
                return response()->json(['message' => 'Opportunity ne pripada izabranom customeru.'], 422);
            }
        }

        $act = Activity::create(array_merge($data, [
            'owner_id' => Auth::id(), // sales_rep kao vlasnik aktivnosti (može i menadžer u drugim endpointima)
        ]));

        $act->load(['owner', 'customer', 'opportunity']);

        return (new ActivityResource($act))
                ->response()
                ->setStatusCode(201);
    }

    // SK15: Izmeni status activity-a (closed itd)
    public function updateStatus(Request $request, $id)
    {
        $this->ensureSalesRep();

        $act = Activity::findOrFail($id);

        // dozvoli izmenu samo vlasniku aktivnosti
        if ($act->owner_id !== Auth::id()) {
            abort(403, 'Niste vlasnik ove aktivnosti.');
        }

        $data = $request->validate([
            'status' => 'required|in:open,completed,cancelled',
        ]);

        $act->update(['status' => $data['status']]);
        $act->load(['owner', 'customer', 'opportunity']);

        return new ActivityResource($act);
    }

    private function ensureSalesRep(): void
    {
        if (Auth::user()?->role !== User::ROLE_SALES_REP) {
            abort(403, 'Dozvoljeno samo prodavcima (sales_rep).');
        }
    }
}
