import type { Exercise } from './exercises'

/** 動作庫（free-exercise-db）沒有的固定器械動作；沒有示範照片，用好食光自己畫的插畫 */
export const MACHINE_EXERCISES: Exercise[] = [
  {
    id: 'mx-lateral-raise',
    zh: '機械側平舉',
    en: 'Machine Lateral Raise',
    equip: 'machine',
    primary: ['shoulders'],
    secondary: ['traps'],
    level: 'beginner',
    compound: false,
    move: 'push',
    noPhoto: true,
    cue: '用手肘把護墊往外上方推，舉到跟肩膀同高就好，不要聳肩',
    steps: [
      'Adjust the seat so your shoulders line up with the machine pivot points.',
      'Sit with your chest against the pad and place the outside of your upper arms against the arm pads, holding the handles lightly.',
      'Raise your arms out to the sides by driving with your elbows until your upper arms are parallel to the floor.',
      'Pause briefly at the top, then lower the pads slowly to the starting position.',
    ],
    stepsZh: [
      '調整座椅高度，讓肩膀對齊機器的轉軸',
      '坐好、胸口貼著靠墊，上臂外側靠在手臂護墊上，手輕握把手',
      '用手肘帶動，把雙臂往兩側舉到上臂跟地面平行',
      '在最高點停一下，再慢慢放回起始位置',
    ],
  },
]
