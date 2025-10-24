<?php
// app/Models/Opportunity.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Opportunity extends Model
{
    use HasFactory;

    // Salesforce-like stages
    public const STAGE_PROSPECTING   = 'Prospecting';
    public const STAGE_QUALIFICATION = 'Qualification';
    public const STAGE_PROPOSAL      = 'Proposal';
    public const STAGE_NEGOTIATION   = 'Negotiation';
    public const STAGE_CLOSED_WON    = 'Closed Won';
    public const STAGE_CLOSED_LOST   = 'Closed Lost';

    protected $fillable = [
        'account_id', 'contact_id', 'owner_id',
        'name', 'amount', 'close_date', 'stage', 'probability', 'description',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'close_date'  => 'date',
        'probability' => 'integer',
    ];

    protected $appends = ['is_won', 'is_lost'];

    public function owner()     { return $this->belongsTo(User::class, 'owner_id'); }
    public function account()   { return $this->belongsTo(Account::class); }
    public function contact()   { return $this->belongsTo(Contact::class); }
    public function activities(){ return $this->morphMany(Activity::class, 'activityable'); }

    public function getIsWonAttribute(): bool  { return $this->stage === self::STAGE_CLOSED_WON; }
    public function getIsLostAttribute(): bool { return $this->stage === self::STAGE_CLOSED_LOST; }
}
