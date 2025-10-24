<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Customer Export</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
        h1, h2, h3 { margin: 0 0 6px; }
        .muted { color: #666; }
        .section { margin-top: 18px; }
        .row { display: flex; gap: 16px; }
        .col { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; vertical-align: top; }
        th { background: #f7f7f7; }
        img.logo { max-height: 60px; }
        .badge { display:inline-block; padding:2px 6px; border-radius:3px; background:#eee; font-size:11px; }
    </style>
</head>
<body>
    <h1>Customer Export</h1>
    <p class="muted">Generated: {{ now()->format('Y-m-d H:i') }}</p>

    <div class="section">
        <h2>{{ $customer->name }}</h2>
        <div class="row">
            <div class="col">
                <strong>Email:</strong> {{ $customer->email ?? '—' }}<br>
                <strong>Phone:</strong> {{ $customer->phone ?? '—' }}<br>
                <strong>Website:</strong> {{ $customer->website ?? '—' }}<br>
                <strong>Industry:</strong> {{ $customer->industry ?? '—' }}<br>
                <strong>Address:</strong> {{ $customer->address ?? '—' }}<br>
            </div>
            <div class="col">
                <strong>Owner:</strong>
                @if($customer->owner)
                    {{ $customer->owner->name }} ({{ $customer->owner->role }})<br>
                    <span class="muted">{{ $customer->owner->email }}</span><br>
                @else
                    —
                @endif
                @if($customer->image_url)
                    <div style="margin-top:8px;">
                        <img src="{{ $customer->image_url }}" alt="Customer Image" class="logo">
                    </div>
                @endif
            </div>
        </div>
        @if($customer->notes)
            <div class="section">
                <strong>Notes:</strong><br>
                <div>{{ $customer->notes }}</div>
            </div>
        @endif
    </div>

    <div class="section">
        <h3>Opportunities ({{ $customer->opportunities->count() }})</h3>
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Stage</th>
                    <th>Amount</th>
                    <th>Close Date</th>
                    <th>Probability</th>
                    <th>Owner</th>
                </tr>
            </thead>
            <tbody>
                @forelse($customer->opportunities as $opp)
                    <tr>
                        <td>{{ $opp->title }}</td>
                        <td><span class="badge">{{ $opp->stage }}</span></td>
                        <td>{{ number_format((float)($opp->amount ?? 0), 2) }}</td>
                        <td>{{ optional($opp->close_date)->format('Y-m-d') ?? '—' }}</td>
                        <td>{{ $opp->probability !== null ? $opp->probability.'%' : '—' }}</td>
                        <td>
                            @if($opp->owner)
                                {{ $opp->owner->name }} ({{ $opp->owner->role }})<br>
                                <span class="muted">{{ $opp->owner->email }}</span>
                            @else
                                —
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6">No opportunities.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Activities ({{ $customer->activities->count() }})</h3>
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Due At</th>
                    <th>Owner</th>
                    <th>Linked Opportunity</th>
                </tr>
            </thead>
            <tbody>
                @forelse($customer->activities as $act)
                    <tr>
                        <td>{{ $act->subject }}</td>
                        <td>{{ $act->type }}</td>
                        <td><span class="badge">{{ $act->status }}</span></td>
                        <td>{{ optional($act->due_at)->format('Y-m-d H:i') ?? '—' }}</td>
                        <td>
                            @if($act->owner)
                                {{ $act->owner->name }} ({{ $act->owner->role }})<br>
                                <span class="muted">{{ $act->owner->email }}</span>
                            @else
                                —
                            @endif
                        </td>
                        <td>
                            @if($act->opportunity)
                                {{ $act->opportunity->title }} ({{ $act->opportunity->stage }})
                            @else
                                —
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6">No activities.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

</body>
</html>
