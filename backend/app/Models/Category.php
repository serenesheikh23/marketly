<?php

namespace App\Models;

use App\Enums\CategoryType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'name',
        'name_ar',
        'slug',
        'type',
        'description',
        'description_ar',
        'icon',
        'image_base64',
        'image_url',
        'sort_order',
        'form_schema', // <-- Added this
    ];

    protected $casts = [
        'type' => CategoryType::class,
        'sort_order' => 'integer',
        'form_schema' => 'array', // <-- Added this (decodes JSON string to array)
    ];

    protected static function booted(): void
    {
        static::creating(function (Category $category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function manualOrderFields(): HasMany
    {
        return $this->hasMany(ManualOrderField::class);
    }

    public function isManual(): bool
    {
        return $this->type === CategoryType::Manual;
    }
}
