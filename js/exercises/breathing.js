/**
 * 呼吸エクササイズ（breathing）— 6種
 */
ExerciseRegistry.register([
  {
    id: 'breath-diaphragm',
    category: 'breathing',
    name: '腹式呼吸',
    description: 'お腹に手を当て、鼻から4秒吸い口から6秒吐く',
    intensity: 1,
    defaultSets: 1,
    defaultReps: 10,
    defaultDuration: null,
    position: 'any',
    notes: null
  },
  {
    id: 'breath-pursed-lip',
    category: 'breathing',
    name: '口すぼめ呼吸',
    description: '鼻から吸い、口をすぼめてゆっくり吐く',
    intensity: 1,
    defaultSets: 1,
    defaultReps: 10,
    defaultDuration: null,
    position: 'any',
    notes: null
  },
  {
    id: 'breath-square',
    category: 'breathing',
    name: 'ボックス呼吸',
    description: '4秒吸う→4秒止める→4秒吐く→4秒止める',
    intensity: 1,
    defaultSets: 1,
    defaultReps: 5,
    defaultDuration: null,
    position: 'any',
    notes: null
  },
  {
    id: 'breath-rib',
    category: 'breathing',
    name: '胸郭呼吸',
    description: '胸に手を当て肋骨を広げるように吸う',
    intensity: 1,
    defaultSets: 1,
    defaultReps: 10,
    defaultDuration: null,
    position: 'seated',
    notes: null
  },
  {
    id: 'breath-counting',
    category: 'breathing',
    name: '数息呼吸',
    description: '呼吸を数えながらゆっくり行う',
    intensity: 1,
    defaultSets: 1,
    defaultReps: null,
    defaultDuration: 120,
    position: 'any',
    notes: null
  },
  {
    id: 'breath-sighing',
    category: 'breathing',
    name: 'ため息呼吸',
    description: '深く吸って「はぁ」と長く吐く',
    intensity: 1,
    defaultSets: 1,
    defaultReps: 5,
    defaultDuration: null,
    position: 'any',
    notes: null
  }
]);
