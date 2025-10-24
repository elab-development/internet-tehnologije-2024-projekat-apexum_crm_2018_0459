<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\OpportunityResource;
use App\Models\Customer;
use App\Models\Opportunity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OpportunityController extends Controller
{
    // SK12: Dodaj nov opportunity (owner = sales_rep only)
    public function store(Request $request)
    {
        $this->ensureSalesRep();

        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'title'       => 'required|string|max:255',
            'stage'       => 'required|in:prospecting,qualification,proposal,won,lost',
            'amount'      => 'nullable|numeric|min:0',
            'close_date'  => 'nullable|date',
            'probability' => 'nullable|integer|min:0|max:100',
            'source'      => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        // vlasnik = trenutni user i mora biti sales_rep
        /** @var User $me */
        $me = Auth::user();

        // Customer mora postojati (validirano) i generalno nije bitno ko ga poseduje za kreiranje prilike,
        // ali po tvom pravilu owner prilike je sales_rep (trenutni korisnik).
        $customer = Customer::findOrFail($data['customer_id']);

        $opp = Opportunity::create(array_merge($data, [
            'owner_id' => $me->id,
        ]));

        $opp->load(['owner', 'customer', 'activities.owner']);

        return (new OpportunityResource($opp))
                ->response()
                ->setStatusCode(201);
    }

    // SK13: Ažuriraj opportunity - stage (won/lost/itd)
    public function update(Request $request, $id)
    {
        $this->ensureSalesRep();

        $opp = Opportunity::findOrFail($id);

        // dozvoli izmenu samo vlasniku opportunity-ja
        if ($opp->owner_id !== Auth::id()) {
            abort(403, 'Niste vlasnik ove prilike.');
        }

        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'stage'       => 'sometimes|in:prospecting,qualification,proposal,won,lost',
            'amount'      => 'sometimes|numeric|min:0|nullable',
            'close_date'  => 'sometimes|date|nullable',
            'probability' => 'sometimes|integer|min:0|max:100|nullable',
            'source'      => 'sometimes|string|max:255|nullable',
            'description' => 'sometimes|string|nullable',
        ]);

        $opp->update($data);

        $opp->load(['owner', 'customer', 'activities.owner']);

        return new OpportunityResource($opp);
    }

    private function ensureSalesRep(): void
    {
        if (Auth::user()?->role !== User::ROLE_SALES_REP) {
            abort(403, 'Dozvoljeno samo prodavcima (sales_rep).');
        }
    }
}
