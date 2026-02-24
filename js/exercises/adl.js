/**
 * ADL動作練習（adl）— 6種
 */
ExerciseRegistry.register([
  {
    id: 'adl-bed-mobility',
    category: 'adl',
    name: '起き上がり練習',
    description: 'ベッドから起き上がる動作を練習',
    intensity: 2,
    defaultSets: 2,
    defaultReps: 5,
    defaultDuration: null,
    position: 'supine',
    notes: null
  },
  {
    id: 'adl-transfer',
    category: 'adl',
    name: '移乗練習',
    description: 'ベッド⇔車椅子の乗り移り',
    intensity: 2,
    defaultSets: 2,
    defaultReps: 5,
    defaultDuration: null,
    position: 'seated',
    notes: null
  },
  {
    id: 'adl-reaching',
    category: 'adl',
    name: 'リーチング練習',
    description: '高い棚や低い場所への手伸ばし',
    intensity: 1,
    defaultSets: 2,
    defaultReps: 5,
    defaultDuration: null,
    position: 'standing',
    notes: null
  },
  {
    id: 'adl-dressing',
    category: 'adl',
    name: '更衣動作練習',
    description: '衣服の着脱を安全に行う練習',
    intensity: 1,
    defaultSets: 2,
    defaultReps: 3,
    defaultDuration: null,
    position: 'seated',
    notes: null
  },
  {
    id: 'adl-toileting',
    category: 'adl',
    name: 'トイレ動作練習',
    description: '便座からの立ち座り',
    intensity: 2,
    defaultSets: 2,
    defaultReps: 5,
    defaultDuration: null,
    position: 'standing',
    notes: null
  },
  {
    id: 'adl-kitchen',
    category: 'adl',
    name: '調理動作練習',
    description: '立位で簡単な調理動作を行う',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 300,
    position: 'standing',
    notes: null
  }
]);
