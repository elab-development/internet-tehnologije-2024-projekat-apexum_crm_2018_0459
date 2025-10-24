<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    public const TYPE_CALL    = 'call';
    public const TYPE_EMAIL   = 'email';
    public const TYPE_MEETING = 'meeting';
    public const TYPE_TASK    = 'task';

    public const STATUS_OPEN      = 'open';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'customer_id',
        'opportunity_id',
        'owner_id',
        'type',
        'status',
        'subject',
        'due_at',
        'notes',
    ];

    protected $casts = [
        'due_at' => 'datetime',
    ];

    public function setTypeAttribute($value): void
    {
        $type = strtolower($value);
        if (! in_array($type, [self::TYPE_CALL, self::TYPE_EMAIL, self::TYPE_MEETING, self::TYPE_TASK], true)) {
            throw new \InvalidArgumentException("Invalid activity type: {$value}");
        }
        $this->attributes['type'] = $type;
    }

    public function setStatusAttribute($value): void
    {
        $status = strtolower($value);
        if (! in_array($status, [self::STATUS_OPEN, self::STATUS_COMPLETED, self::STATUS_CANCELLED], true)) {
            throw new \InvalidArgumentException("Invalid activity status: {$value}");
        }
        $this->attributes['status'] = $status;
    }

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function opportunity()
    {
        return $this->belongsTo(Opportunity::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
