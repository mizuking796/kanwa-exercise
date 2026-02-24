/**
 * リラクセーション（relaxation）— 5種
 */
ExerciseRegistry.register([
  {
    id: 'relax-pmr',
    category: 'relaxation',
    name: '漸進的筋弛緩法',
    description: '各部位を5秒緊張→脱力を繰り返す',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 300,
    position: 'supine',
    notes: null
  },
  {
    id: 'relax-body-scan',
    category: 'relaxation',
    name: 'ボディスキャン',
    description: '足先から頭まで意識を向け力を抜く',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 300,
    position: 'supine',
    notes: null
  },
  {
    id: 'relax-imagery',
    category: 'relaxation',
    name: 'イメージリラクセーション',
    description: '心地よい場所を思い浮かべリラックス',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 300,
    position: 'any',
    notes: null
  },
  {
    id: 'relax-hand-massage',
    category: 'relaxation',
    name: 'ハンドマッサージ',
    description: '手のひらと指をゆっくり揉む',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 180,
    position: 'seated',
    notes: null
  },
  {
    id: 'relax-warm-hands',
    category: 'relaxation',
    name: '温かい手',
    description: '両手をこすり合わせ目に当てる',
    intensity: 1,
    defaultSets: 1,
    defaultReps: 5,
    defaultDuration: null,
    position: 'seated',
    notes: null
  }
]);
