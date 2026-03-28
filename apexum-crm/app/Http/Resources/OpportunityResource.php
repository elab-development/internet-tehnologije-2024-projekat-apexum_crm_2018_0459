<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OpportunityResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'stage'       => $this->stage,
            'amount'      => $this->amount,
            'close_date'  => optional($this->close_date)->toDateString(),
            'probability' => $this->probability,
            'source'      => $this->source,
            'description' => $this->description,

            'owner'    => new UserResource($this->whenLoaded('owner')),
            'customer' => new CustomerBriefResource($this->whenLoaded('customer')),

            // Ako želiš, možeš dodati i aktivnosti prilike:
            'activities' => ActivityResource::collection($this->whenLoaded('activities')),

            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
