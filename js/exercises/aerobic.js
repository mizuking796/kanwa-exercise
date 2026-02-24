/**
 * 有酸素運動（aerobic）— 8種
 */
ExerciseRegistry.register([
  {
    id: 'aerobic-walk',
    category: 'aerobic',
    name: '歩行',
    description: '平地をゆっくり歩く',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 300,
    position: 'standing',
    notes: null
  },
  {
    id: 'aerobic-seated-march',
    category: 'aerobic',
    name: '座位足踏み',
    description: '椅子に座ったまま足踏み',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 180,
    position: 'seated',
    notes: null
  },
  {
    id: 'aerobic-step-touch',
    category: 'aerobic',
    name: 'ステップタッチ',
    description: '左右にステップを踏む',
    intensity: 2,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 180,
    position: 'standing',
    notes: null
  },
  {
    id: 'aerobic-arm-cycle',
    category: 'aerobic',
    name: '腕回しエルゴ風',
    description: '両腕を大きく回す（エルゴメーター模倣）',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 180,
    position: 'seated',
    notes: null
  },
  {
    id: 'aerobic-seated-pedal',
    category: 'aerobic',
    name: '座位ペダリング',
    description: '椅子に座り足を交互に踏み出す',
    intensity: 2,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 180,
    position: 'seated',
    notes: null
  },
  {
    id: 'aerobic-walk-fast',
    category: 'aerobic',
    name: '速歩',
    description: 'やや速めのペースで歩く',
    intensity: 2,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 300,
    position: 'standing',
    notes: null
  },
  {
    id: 'aerobic-stair-slow',
    category: 'aerobic',
    name: 'ゆっくり階段昇降',
    description: '1段ずつゆっくり昇降する',
    intensity: 3,
    defaultSets: 2,
    defaultReps: 10,
    defaultDuration: null,
    position: 'standing',
    notes: null
  },
  {
    id: 'aerobic-dance-simple',
    category: 'aerobic',
    name: '簡単なリズム運動',
    description: '音楽に合わせて体を動かす',
    intensity: 2,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 180,
    position: 'any',
    notes: null
  }
]);
