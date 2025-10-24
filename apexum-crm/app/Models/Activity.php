<?php
// app/Models/Activity.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Activity extends Model
{
    use HasFactory;

    // Unify tasks, calls, emails, meetings like Salesforce "Activity"
    public const TYPE_TASK    = 'task';
    public const TYPE_CALL    = 'call';
    public const TYPE_EMAIL   = 'email';
    public const TYPE_MEETING = 'meeting';

    public const STATUS_OPEN     = 'open';
    public const STATUS_DONE     = 'done';
    public const STATUS_CANCELED = 'canceled';

    protected $fillable = [
        'activityable_id', 'activityable_type', // Account | Contact | Opportunity
        'user_id', 'type', 'subject', 'description',
        'due_at', 'completed_at', 'status',
    ];

    protected $casts = [
        'due_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function activityable() { return $this->morphTo(); }
    public function user()         { return $this->belongsTo(User::class); }
}
