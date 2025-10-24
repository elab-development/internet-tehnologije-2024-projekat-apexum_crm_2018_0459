<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use PDF; // <-- Barryvdh\DomPDF\Facade\Pdf

class ExportController extends Controller
{
    // SK16: Export customer (+ opportunities & activities) as PDF
    public function exportCustomerPdf($customerId)
    {
        $user = Auth::user();

        // Sales rep can export only their customers; manager/admin can export any
        $query = Customer::with([
            'owner',
            'opportunities.owner',
            'activities.owner',
            'activities.opportunity',
        ])->where('id', $customerId);

        if ($user->role === User::ROLE_SALES_REP) {
            $query->where('owner_id', $user->id);
        }

        $customer = $query->firstOrFail();

        // Render Blade -> PDF
        $pdf = PDF::loadView('pdf.customer_export', [
            'customer' => $customer,
        ])->setPaper('a4');

        $filename = 'customer_'.$customer->id.'_export.pdf';

        // Download (or ->stream($filename) for inline)
        return $pdf->download($filename);
    }
}
