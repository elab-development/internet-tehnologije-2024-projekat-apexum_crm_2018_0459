<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'      => $this->id,
            'type'    => $this->type,
            'status'  => $this->status,
            'subject' => $this->subject,
            'due_at'  => optional($this->due_at)->toDateTimeString(),
            'notes'   => $this->notes,

            'owner'      => new UserResource($this->whenLoaded('owner')),
            'customer'   => new CustomerBriefResource($this->whenLoaded('customer')),
            'opportunity'=> new OpportunityBriefResource($this->whenLoaded('opportunity')),

            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
