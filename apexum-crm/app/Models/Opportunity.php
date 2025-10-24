<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Opportunity extends Model
{
    use HasFactory;

    public const STAGE_PROSPECTING   = 'prospecting';
    public const STAGE_QUALIFICATION = 'qualification';
    public const STAGE_PROPOSAL      = 'proposal';
    public const STAGE_WON           = 'won';
    public const STAGE_LOST          = 'lost';

    public const STAGES = [
        self::STAGE_PROSPECTING,
        self::STAGE_QUALIFICATION,
        self::STAGE_PROPOSAL,
        self::STAGE_WON,
        self::STAGE_LOST,
    ];

    protected $fillable = [
        'customer_id',
        'owner_id',
        'title',
        'stage',
        'amount',
        'close_date',
        'probability',
        'source',
        'description',
    ];

    protected $casts = [
        'close_date'  => 'date',
        'amount'      => 'decimal:2',
        'probability' => 'integer',
    ];

    public function setStageAttribute($value): void
    {
        $stage = strtolower($value);
        if (! in_array($stage, self::STAGES, true)) {
            throw new \InvalidArgumentException("Invalid stage: {$value}");
        }
        $this->attributes['stage'] = $stage;
    }

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }
}
