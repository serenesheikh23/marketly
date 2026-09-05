    public function formSchema(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        // 1. Try to use the new form_schema column
        $fields = $category->form_schema;
        if (is_string($fields)) {
            $fields = json_decode($fields, true);
        }

        // 2. FALLBACK: If form_schema is empty, use the old manualOrderFields table
        if (empty($fields)) {
            $fields = $category->manualOrderFields()
                ->orderBy('sort_order')
                ->get()
                ->map(function ($f) {
                    return [
                        'key' => $f->key,
                        'label' => $f->label,
                        'type' => $f->type,
                        'required' => $f->required,
                        'options' => $f->options ?? [],
                    ];
                })->toArray();
        }

        return response()->json([
            'category' => $category,
            'fields' => $fields ?? [],
        ]);
    }
