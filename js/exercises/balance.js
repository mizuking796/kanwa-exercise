/**
 * バランス訓練（balance）— 8種
 */
ExerciseRegistry.register([
  {
    id: 'balance-tandem',
    category: 'balance',
    name: 'タンデム立位',
    description: '片足をもう片足の前に置いて立つ',
    intensity: 2,
    defaultSets: 3,
    defaultReps: null,
    defaultDuration: 15,
    position: 'standing',
    notes: null
  },
  {
    id: 'balance-one-leg',
    category: 'balance',
    name: '片足立ち',
    description: '支持ありで片足立ち',
    intensity: 2,
    defaultSets: 3,
    defaultReps: null,
    defaultDuration: 15,
    position: 'standing',
    notes: null
  },
  {
    id: 'balance-heel-toe',
    category: 'balance',
    name: 'つぎ足歩行',
    description: 'かかとをつま先に付けて歩く',
    intensity: 2,
    defaultSets: 1,
    defaultReps: 10,
    defaultDuration: null,
    position: 'standing',
    notes: null
  },
  {
    id: 'balance-weight-shift',
    category: 'balance',
    name: '重心移動',
    description: '左右にゆっくり体重を移す',
    intensity: 1,
    defaultSets: 1,
    defaultReps: 10,
    defaultDuration: null,
    position: 'standing',
    notes: null
  },
  {
    id: 'balance-reach',
    category: 'balance',
    name: 'リーチ運動',
    description: '前方・側方に手を伸ばす',
    intensity: 2,
    defaultSets: 2,
    defaultReps: 5,
    defaultDuration: null,
    position: 'standing',
    notes: null
  },
  {
    id: 'balance-seated-lean',
    category: 'balance',
    name: '座位バランス',
    description: '椅子で前後左右に体を傾ける',
    intensity: 1,
    defaultSets: 2,
    defaultReps: 5,
    defaultDuration: null,
    position: 'seated',
    notes: null
  },
  {
    id: 'balance-step-over',
    category: 'balance',
    name: 'またぎ動作',
    description: '障害物をまたぐ練習',
    intensity: 3,
    defaultSets: 2,
    defaultReps: 5,
    defaultDuration: null,
    position: 'standing',
    notes: null
  },
  {
    id: 'balance-clock-reach',
    category: 'balance',
    name: '時計リーチ',
    description: '時計の方向に手足を伸ばす',
    intensity: 2,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 60,
    position: 'standing',
    notes: null
  }
]);
