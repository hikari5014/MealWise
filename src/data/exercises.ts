// 動作資料來自 free-exercise-db（公眾領域 Unlicense，https://github.com/yuhonas/free-exercise-db）
// 中文名稱、器材分類、動作要點由好食光整理；照片在 public/exercises/<id>-0.webp、-1.webp
import type { Equip, FxMuscle } from '../lib/workout'
import { CARDIO_EXERCISES, CARDIO_EXTRA, type CardioMetric } from './cardio'
import type { FoodImage } from './foodImages'

export interface Exercise {
  id: string
  zh: string
  en: string
  equip: Equip
  primary: FxMuscle[]
  secondary: FxMuscle[]
  level: 'beginner' | 'intermediate' | 'expert'
  compound: boolean
  /** 推、拉、核心、有氧（依 free-exercise-db 的 force 欄位） */
  move: 'push' | 'pull' | 'core' | 'cardio'
  /** 一句話動作要點 */
  cue: string
  /** 原文步驟（英文） */
  steps: string[]
  /** 中文步驟（逐條對應英文） */
  stepsZh?: string[]
  /** 有氧：每一段要記哪些數字 */
  metrics?: CardioMetric[]
  /** 有氧：沒有照片時顯示的圖示，也用在組合課表 */
  icon?: FoodImage
  /** 有氧：MET，用來估算消耗熱量 */
  met?: number
  /** 沒有示範照片 */
  noPhoto?: boolean
}

export const EXERCISES: Exercise[] = [
 {
  "id": "barbell-bench-press-medium-grip",
  "zh": "槓鈴臥推",
  "en": "Barbell Bench Press - Medium Grip",
  "equip": "barbell",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "肩胛骨後收下壓，槓鈴放到胸口中下緣，腳踩穩地面",
  "steps": [
   "Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
   "From the starting position, breathe in and begin coming down slowly until the bar touches your middle chest.",
   "After a brief pause, push the bar back to the starting position as you breathe out. Focus on pushing the bar using your chest muscles. Lock your arms and squeeze your chest in the contracted position at the top of the motion, hold for a second and then start coming down slowly again. Tip: Ideally, lowering the weight should take about twice as long as raising it.",
   "Repeat the movement for the prescribed amount of repetitions.",
   "When you are done, place the bar back in the rack."
  ],
  "move": "push",
  "stepsZh": [
   "躺在平板臥推椅上，用中等握距（動作中段時前臂與上臂約成 90 度），將槓鈴從架上取下，手臂伸直打直舉在身體正上方，這是起始姿勢。",
   "從起始姿勢吸氣，慢慢把槓鈴往下放，直到碰到胸口中段。",
   "稍停一下，吐氣把槓鈴推回起始位置，專心用胸肌出力。在頂端手臂伸直、夾緊胸肌停 1 秒，再慢慢往下放。小提醒：理想上，下放的時間大約是推起的 2 倍。",
   "依照課表的次數重複動作。",
   "做完後把槓鈴放回架上。"
  ]
 },
 {
  "id": "barbell-incline-bench-press-medium-grip",
  "zh": "上斜槓鈴臥推",
  "en": "Barbell Incline Bench Press - Medium Grip",
  "equip": "barbell",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "椅背約 30 度，槓鈴落在鎖骨下方，練上胸",
  "steps": [
   "Lie back on an incline bench. Using a medium-width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
   "As you breathe in, come down slowly until you feel the bar on you upper chest.",
   "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms in the contracted position, squeeze your chest, hold for a second and then start coming down slowly again. Tip: it should take at least twice as long to go down than to come up.",
   "Repeat the movement for the prescribed amount of repetitions.",
   "When you are done, place the bar back in the rack."
  ],
  "move": "push",
  "stepsZh": [
   "躺在上斜臥推椅上，用中等握距（動作中段時前臂與上臂約成 90 度），將槓鈴從架上取下，手臂伸直舉在身體正上方，這是起始姿勢。",
   "吸氣，慢慢往下放，直到槓鈴碰到上胸。",
   "停 1 秒，吐氣用胸肌把槓鈴推回起始位置。在頂端手臂伸直、夾緊胸肌停 1 秒，再慢慢往下放。小提醒：下放的時間至少要是推起的 2 倍。",
   "依照課表的次數重複動作。",
   "做完後把槓鈴放回架上。"
  ]
 },
 {
  "id": "decline-barbell-bench-press",
  "zh": "下斜槓鈴臥推",
  "en": "Decline Barbell Bench Press",
  "equip": "barbell",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "腳勾穩，槓鈴落在胸口下緣，練下胸",
  "steps": [
   "Secure your legs at the end of the decline bench and slowly lay down on the bench.",
   "Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. The arms should be perpendicular to the floor. This will be your starting position. Tip: In order to protect your rotator cuff, it is best if you have a spotter help you lift the barbell off the rack.",
   "As you breathe in, come down slowly until you feel the bar on your lower chest.",
   "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms and squeeze your chest in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up).",
   "Repeat the movement for the prescribed amount of repetitions.",
   "When you are done, place the bar back in the rack."
  ],
  "move": "push",
  "stepsZh": [
   "把雙腳固定在下斜臥推椅的尾端，慢慢躺下。",
   "用中等握距（動作中段時前臂與上臂約成 90 度），將槓鈴從架上取下，手臂伸直舉在身體正上方，手臂與地面垂直，這是起始姿勢。小提醒：為了保護旋轉肌袖，最好請輔助者幫你把槓鈴從架上取下。",
   "吸氣，慢慢往下放，直到槓鈴碰到下胸。",
   "停 1 秒，吐氣用胸肌把槓鈴推回起始位置。在頂端手臂伸直、夾緊胸肌停 1 秒，再慢慢往下放。小提醒：下放的時間至少要是推起的 2 倍。",
   "依照課表的次數重複動作。",
   "做完後把槓鈴放回架上。"
  ]
 },
 {
  "id": "dumbbell-bench-press",
  "zh": "啞鈴臥推",
  "en": "Dumbbell Bench Press",
  "equip": "dumbbell",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "下放到胸側感覺伸展，推起時兩顆啞鈴靠近但不互撞",
  "steps": [
   "Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.",
   "Then, using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.",
   "Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. The dumbbells should be just to the sides of your chest, with your upper arm and forearm creating a 90 degree angle. Be sure to maintain full control of the dumbbells at all times. This will be your starting position.",
   "Then, as you breathe out, use your chest to push the dumbbells up. Lock your arms at the top of the lift and squeeze your chest, hold for a second and then begin coming down slowly. Tip: Ideally, lowering the weight should take about twice as long as raising it.",
   "Repeat the movement for the prescribed amount of repetitions of your training program."
  ],
  "move": "push",
  "stepsZh": [
   "雙手各拿一個啞鈴放在大腿上，躺在平板臥推椅上，掌心相對。",
   "利用大腿幫忙把啞鈴往上頂，一次一邊舉起，在胸前與肩同寬的位置拿穩。",
   "到與肩同寬的位置後，把手腕往前轉，讓掌心朝向腳的方向。啞鈴位在胸部兩側，上臂與前臂約成 90 度。全程都要穩穩控制啞鈴，這是起始姿勢。",
   "吐氣，用胸肌把啞鈴往上推。在頂端手臂伸直、夾緊胸肌停 1 秒，再慢慢往下放。小提醒：理想上，下放的時間大約是推起的 2 倍。",
   "依照課表的次數重複動作。"
  ]
 },
 {
  "id": "incline-dumbbell-press",
  "zh": "上斜啞鈴臥推",
  "en": "Incline Dumbbell Press",
  "equip": "dumbbell",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "椅背 30–45 度，手肘約 45 度角，推向上胸",
  "steps": [
   "Lie back on an incline bench with a dumbbell in each hand atop your thighs. The palms of your hands will be facing each other.",
   "Then, using your thighs to help push the dumbbells up, lift the dumbbells one at a time so that you can hold them at shoulder width.",
   "Once you have the dumbbells raised to shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. This will be your starting position.",
   "Be sure to keep full control of the dumbbells at all times. Then breathe out and push the dumbbells up with your chest.",
   "Lock your arms at the top, hold for a second, and then start slowly lowering the weight. Tip Ideally, lowering the weights should take about twice as long as raising them.",
   "Repeat the movement for the prescribed amount of repetitions.",
   "When you are done, place the dumbbells back on your thighs and then on the floor. This is the safest manner to release the dumbbells."
  ],
  "move": "push",
  "stepsZh": [
   "雙手各拿一個啞鈴放在大腿上，躺在上斜臥推椅上，掌心相對。",
   "利用大腿幫忙把啞鈴往上頂，一次一邊舉起，在與肩同寬的位置拿穩。",
   "啞鈴舉到與肩同寬後，把手腕往前轉，讓掌心朝向腳的方向，這是起始姿勢。",
   "全程都要穩穩控制啞鈴。吐氣，用胸肌把啞鈴往上推。",
   "在頂端手臂伸直停 1 秒，再慢慢往下放。小提醒：理想上，下放的時間大約是推起的 2 倍。",
   "依照課表的次數重複動作。",
   "做完後先把啞鈴放回大腿上，再放到地上，這是最安全的放下方式。"
  ]
 },
 {
  "id": "dumbbell-flyes",
  "zh": "啞鈴飛鳥",
  "en": "Dumbbell Flyes",
  "equip": "dumbbell",
  "primary": [
   "chest"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘微彎固定，像抱大樹一樣打開再合起",
  "steps": [
   "Lie down on a flat bench with a dumbbell on each hand resting on top of your thighs. The palms of your hand will be facing each other.",
   "Then using your thighs to help raise the dumbbells, lift the dumbbells one at a time so you can hold them in front of you at shoulder width with the palms of your hands facing each other. Raise the dumbbells up like you're pressing them, but stop and hold just before you lock out. This will be your starting position.",
   "With a slight bend on your elbows in order to prevent stress at the biceps tendon, lower your arms out at both sides in a wide arc until you feel a stretch on your chest. Breathe in as you perform this portion of the movement. Tip: Keep in mind that throughout the movement, the arms should remain stationary; the movement should only occur at the shoulder joint.",
   "Return your arms back to the starting position as you squeeze your chest muscles and breathe out. Tip: Make sure to use the same arc of motion used to lower the weights.",
   "Hold for a second at the contracted position and repeat the movement for the prescribed amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "雙手各拿一個啞鈴放在大腿上，躺在平板臥推椅上，掌心相對。",
   "利用大腿幫忙把啞鈴往上頂，一次一邊舉起，在胸前與肩同寬的位置拿穩，掌心相對。像推舉一樣把啞鈴往上舉，但在手臂完全打直前停住，這是起始姿勢。",
   "手肘微彎以減少二頭肌腱的壓力，雙臂向兩側畫一個大弧線往下打開，直到感覺胸部有伸展感，下放時吸氣。小提醒：整個動作中手臂角度保持固定，只有肩關節在動。",
   "吐氣，夾緊胸肌，把手臂沿原路收回起始位置。小提醒：收回時要走和下放時相同的弧線。",
   "在收縮位置停 1 秒，依照課表的次數重複動作。"
  ]
 },
 {
  "id": "incline-dumbbell-flyes",
  "zh": "上斜啞鈴飛鳥",
  "en": "Incline Dumbbell Flyes",
  "equip": "dumbbell",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "上斜椅做飛鳥，著重上胸的伸展",
  "steps": [
   "Hold a dumbbell on each hand and lie on an incline bench that is set to an incline angle of no more than 30 degrees.",
   "Extend your arms above you with a slight bend at the elbows.",
   "Now rotate the wrists so that the palms of your hands are facing you. Tip: The pinky fingers should be next to each other. This will be your starting position.",
   "As you breathe in, start to slowly lower the arms to the side while keeping the arms extended and while rotating the wrists until the palms of the hand are facing each other. Tip: At the end of the movement the arms will be by your side with the palms facing the ceiling.",
   "As you exhale start to bring the dumbbells back up to the starting position by reversing the motion and rotating the hands so that the pinky fingers are next to each other again. Tip: Keep in mind that the movement will only happen at the shoulder joint and at the wrist. There is no motion that happens at the elbow joint.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "雙手各拿一個啞鈴，躺在角度不超過 30 度的上斜臥推椅上。",
   "雙臂往上伸直舉在身體上方，手肘微彎。",
   "轉動手腕讓掌心朝向自己，小提醒：兩手小指會靠在一起。這是起始姿勢。",
   "吸氣，手臂保持伸展，慢慢往兩側放下，同時轉動手腕直到掌心相對。小提醒：動作最低點時，手臂位在身體兩側，掌心朝向天花板。",
   "吐氣，反向做回去，把啞鈴帶回起始位置，同時轉動雙手讓小指再次靠在一起。小提醒：只有肩關節和手腕在動，手肘不要彎曲或伸直。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "cable-crossover",
  "zh": "龍門架夾胸",
  "en": "Cable Crossover",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "身體微前傾，雙手往下往內合攏，頂點停一秒",
  "steps": [
   "To get yourself into the starting position, place the pulleys on a high position (above your head), select the resistance to be used and hold the pulleys in each hand.",
   "Step forward in front of an imaginary straight line between both pulleys while pulling your arms together in front of you. Your torso should have a small forward bend from the waist. This will be your starting position.",
   "With a slight bend on your elbows in order to prevent stress at the biceps tendon, extend your arms to the side (straight out at both sides) in a wide arc until you feel a stretch on your chest. Breathe in as you perform this portion of the movement. Tip: Keep in mind that throughout the movement, the arms and torso should remain stationary; the movement should only occur at the shoulder joint.",
   "Return your arms back to the starting position as you breathe out. Make sure to use the same arc of motion used to lower the weights.",
   "Hold for a second at the starting position and repeat the movement for the prescribed amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "把兩側滑輪調到高處（高於頭部），選好重量，雙手各握住一個握把。",
   "往前跨一步，站到兩個滑輪連線的前方，同時把雙臂拉到身體前方合攏。上半身從腰部微微前傾，這是起始姿勢。",
   "手肘微彎以減少二頭肌腱的壓力，雙臂向兩側畫一個大弧線往外打開，直到感覺胸部有伸展感，打開時吸氣。小提醒：整個動作中手臂和身體保持固定，只有肩關節在動。",
   "吐氣，把手臂沿相同的弧線收回起始位置。",
   "在起始位置停 1 秒，依照課表的次數重複動作。"
  ]
 },
 {
  "id": "butterfly",
  "zh": "蝴蝶機夾胸",
  "en": "Butterfly",
  "equip": "machine",
  "primary": [
   "chest"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "椅子調到把手與胸同高，慢慢回放感受伸展",
  "steps": [
   "Sit on the machine with your back flat on the pad.",
   "Take hold of the handles. Tip: Your upper arms should be positioned parallel to the floor; adjust the machine accordingly. This will be your starting position.",
   "Push the handles together slowly as you squeeze your chest in the middle. Breathe out during this part of the motion and hold the contraction for a second.",
   "Return back to the starting position slowly as you inhale until your chest muscles are fully stretched.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "坐上機器，背部平貼靠墊。",
   "握住握把。小提醒：上臂要與地面平行，依此調整機器高度。這是起始姿勢。",
   "吐氣，慢慢把握把往中間合攏，同時夾緊胸肌，在收縮位置停 1 秒。",
   "吸氣，慢慢回到起始位置，直到胸肌完全伸展。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "machine-bench-press",
  "zh": "坐姿推胸機",
  "en": "Machine Bench Press",
  "equip": "machine",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "背貼椅背，推出時不要聳肩、手肘不鎖死",
  "steps": [
   "Sit down on the Chest Press Machine and select the weight.",
   "Step on the lever provided by the machine since it will help you to bring the handles forward so that you can grab the handles and fully extend the arms.",
   "Grab the handles with a palms-down grip and lift your elbows so that your upper arms are parallel to the floor to the sides of your torso. Tip: Your forearms will be pointing forward since you are grabbing the handles. Once you bring the handles forward and extend the arms you will be at the starting position.",
   "Now bring the handles back towards you as you breathe in.",
   "Push the handles away from you as you flex your pecs and you breathe out. Hold the contraction for a second before going back to the starting position.",
   "Repeat for the recommended amount of reps.",
   "When finished step on the lever again and slowly get the handles back to their original place."
  ],
  "move": "push",
  "stepsZh": [
   "坐上推胸機，選好重量。",
   "踩下機器附的踏板，幫忙把握把推到前方，方便你握住握把並把手臂完全伸直。",
   "掌心朝下握住握把，抬起手肘，讓上臂位在身體兩側並與地面平行。小提醒：因為握著握把，前臂會朝向前方。把握把推到前方、手臂伸直後就是起始姿勢。",
   "吸氣，讓握把往身體方向收回。",
   "吐氣，出力夾胸把握把往前推，在收縮位置停 1 秒再回到起始位置。",
   "依照建議的次數重複動作。",
   "做完後再次踩下踏板，慢慢讓握把回到原位。"
  ]
 },
 {
  "id": "leverage-chest-press",
  "zh": "槓桿式推胸機",
  "en": "Leverage Chest Press",
  "equip": "machine",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "握把與胸線同高，推出後慢慢回放",
  "steps": [
   "Load an appropriate weight onto the pins and adjust the seat for your height. The handles should be near the bottom or middle of the pectorals at the beginning of the motion.",
   "Your chest and head should be up and your shoulder blades retracted. This will be your starting position.",
   "Press the handles forward by extending through the elbow.",
   "After a brief pause at the top, return the weight just above the start position, keeping tension on the muscles by not returning the weight to the stops until the set is complete."
  ],
  "move": "push",
  "stepsZh": [
   "在插槓上掛好適當重量，依身高調整座椅。動作開始時，握把應該在胸肌下緣或中段的高度。",
   "挺胸抬頭，肩胛骨往後收，這是起始姿勢。",
   "伸直手肘，把握把往前推。",
   "在頂端稍停，再把重量放回到起始位置前一點點，整組做完前不要讓重量碰到底，保持肌肉持續出力。"
  ]
 },
 {
  "id": "smith-machine-bench-press",
  "zh": "史密斯臥推",
  "en": "Smith Machine Bench Press",
  "equip": "smith",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "軌道固定比較安全，適合自己練大重量",
  "steps": [
   "Place a flat bench underneath the smith machine. Now place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Once the weight you need is selected, lie down on the flat bench. Using a pronated grip that is wider than shoulder width, unlock the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
   "As you breathe in, come down slowly until you feel the bar on your middle chest.",
   "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up.",
   "Repeat the movement for the prescribed amount of repetitions.",
   "When you are done, lock the bar back in the rack."
  ],
  "move": "push",
  "stepsZh": [
   "把平板臥推椅放在史密斯機下方，將槓鈴調到躺下時手臂快伸直就能碰到的高度。選好重量後躺上臥推椅，用比肩略寬的正握握住槓鈴，解開安全鎖，手臂伸直把槓鈴舉在身體正上方，這是起始姿勢。",
   "吸氣，慢慢往下放，直到槓鈴碰到胸口中段。",
   "停 1 秒，吐氣用胸肌把槓鈴推回起始位置。在頂端手臂伸直停 1 秒，再慢慢往下放。小提醒：下放的時間至少要是推起的 2 倍。",
   "依照課表的次數重複動作。",
   "做完後把槓鈴掛回並鎖好。"
  ]
 },
 {
  "id": "pushups",
  "zh": "伏地挺身",
  "en": "Pushups",
  "equip": "body",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "身體一直線，胸口快碰地再推起，核心收緊",
  "steps": [
   "Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length.",
   "Next, lower yourself downward until your chest almost touches the floor as you inhale.",
   "Now breathe out and press your upper body back up to the starting position while squeezing your chest.",
   "After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."
  ],
  "move": "push",
  "stepsZh": [
   "臉朝下趴在地上，雙手撐地，間距約 90 公分（比肩寬），手臂伸直把身體撐起。",
   "吸氣，身體往下降，直到胸口快碰到地面。",
   "吐氣，夾緊胸肌把上半身推回起始位置。",
   "在頂端稍停後，再往下降，依需要的次數重複。"
  ]
 },
 {
  "id": "dips-chest-version",
  "zh": "雙槓撐體（胸）",
  "en": "Dips - Chest Version",
  "equip": "body",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "身體前傾、手肘外開，往下到肩膀略低於手肘",
  "steps": [
   "For this exercise you will need access to parallel bars. To get yourself into the starting position, hold your body at arms length (arms locked) above the bars.",
   "While breathing in, lower yourself slowly with your torso leaning forward around 30 degrees or so and your elbows flared out slightly until you feel a slight stretch in the chest.",
   "Once you feel the stretch, use your chest to bring your body back to the starting position as you breathe out. Tip: Remember to squeeze the chest at the top of the movement for a second.",
   "Repeat the movement for the prescribed amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "這個動作需要雙槓。雙手撐在槓上、手臂伸直，把身體撐在雙槓上方，這是起始姿勢。",
   "吸氣，身體前傾約 30 度，手肘微微向外打開，慢慢往下降，直到胸部有輕微伸展感。",
   "感覺到伸展後，吐氣用胸肌把身體撐回起始位置。小提醒：在頂端記得夾緊胸肌停 1 秒。",
   "依照課表的次數重複動作。"
  ]
 },
 {
  "id": "barbell-squat",
  "zh": "槓鈴深蹲",
  "en": "Barbell Squat",
  "equip": "barbell",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings",
   "lower back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "槓放上背，膝蓋跟腳尖同方向，蹲到大腿與地面平行",
  "steps": [
   "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack to just below shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
   "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
   "Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times and also maintain a straight back. This will be your starting position. (Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances discussed in the foot stances section).",
   "Begin to slowly lower the bar by bending the knees and hips as you maintain a straight posture with the head up. Continue down until the angle between the upper leg and the calves becomes slightly less than 90-degrees. Inhale as you perform this portion of the movement. Tip: If you performed the exercise correctly, the front of the knees should make an imaginary straight line with the toes that is perpendicular to the front. If your knees are past that imaginary line (if they are past your toes) then you are placing undue stress on the knee and the exercise has been performed incorrectly.",
   "Begin to raise the bar as you exhale by pushing the floor with the heel of your foot as you straighten the legs again and go back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "為了安全，建議在深蹲架裡做這個動作。先把槓鈴放在略低於肩膀的高度，調好高度並裝好重量後，走到槓下，把槓鈴放在肩膀後側（脖子稍下方）。",
   "雙手在兩側握住槓鈴，先用腿出力往上推，同時挺直上半身，把槓鈴從架上抬起。",
   "離開深蹲架，雙腳與肩同寬，腳尖微微朝外。全程抬頭、背部打直，這是起始姿勢。（註：這裡以能全面訓練腿部的中等站距為例，你也可以改用其他站距。）",
   "彎曲膝蓋和髖部，慢慢往下蹲，保持抬頭、身體挺直。蹲到大腿與小腿的夾角略小於 90 度，下蹲時吸氣。小提醒：姿勢正確時，膝蓋前緣會和腳尖大致在同一條垂直線上；如果膝蓋超出腳尖太多，會讓膝蓋承受過多壓力，代表動作做錯了。",
   "吐氣，用腳跟踩地，把腿伸直站回起始位置。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "front-barbell-squat",
  "zh": "槓鈴前蹲舉",
  "en": "Front Barbell Squat",
  "equip": "barbell",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "expert",
  "compound": true,
  "cue": "槓放肩前，手肘抬高，上身保持直立",
  "steps": [
   "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, bring your arms up under the bar while keeping the elbows high and the upper arm slightly above parallel to the floor. Rest the bar on top of the deltoids and cross your arms while grasping the bar for total control.",
   "Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso.",
   "Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times as looking down will get you off balance and also maintain a straight back. This will be your starting position. (Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances described in the foot positioning section).",
   "Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the upper leg and the calves becomes slightly less than 90-degrees (which is the point in which the upper legs are below parallel to the floor). Inhale as you perform this portion of the movement. Tip: If you performed the exercise correctly, the front of the knees should make an imaginary straight line with the toes that is perpendicular to the front. If your knees are past that imaginary line (if they are past your toes) then you are placing undue stress on the knee and the exercise has been performed incorrectly.",
   "Begin to raise the bar as you exhale by pushing the floor mainly with the middle of your foot as you straighten the legs again and go back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "為了安全，建議在深蹲架裡做這個動作。先把槓鈴調到適合你身高的高度，裝好重量後，把手臂伸到槓下，手肘抬高，上臂略高於水平。讓槓鈴靠在前三角肌上，雙臂交叉扣住槓鈴，確保穩定。",
   "先用腿出力往上推，同時挺直上半身，把槓鈴從架上抬起。",
   "離開深蹲架，雙腳與肩同寬，腳尖微微朝外。全程抬頭（低頭容易失去平衡）、背部打直，這是起始姿勢。（註：這裡以能全面訓練腿部的中等站距為例，你也可以改用其他站距。）",
   "彎曲膝蓋，慢慢往下蹲，保持抬頭、身體挺直。蹲到大腿與小腿的夾角略小於 90 度（大腿低於水平），下蹲時吸氣。小提醒：姿勢正確時，膝蓋前緣會和腳尖大致在同一條垂直線上；如果膝蓋超出腳尖太多，會讓膝蓋承受過多壓力，代表動作做錯了。",
   "吐氣，主要用腳掌中段踩地，把腿伸直站回起始位置。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "smith-machine-squat",
  "zh": "史密斯深蹲",
  "en": "Smith Machine Squat",
  "equip": "smith",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings",
   "lower back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "腳可以稍微往前站，蹲下時背保持挺直",
  "steps": [
   "To begin, first set the bar on the height that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
   "Hold on to the bar using both arms at each side (palms facing forward), unlock it and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
   "Position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times and also maintain a straight back. This will be your starting position. (Note: For the purposes of this discussion we will use the medium stance which targets overall development; however you can choose any of the three stances discussed in the foot stances section).",
   "Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the upper leg and the calves becomes slightly less than 90-degrees (which is the point in which the upper legs are below parallel to the floor). Inhale as you perform this portion of the movement. Tip: If you performed the exercise correctly, the front of the knees should make an imaginary straight line with the toes that is perpendicular to the front. If your knees are past that imaginary line (if they are past your toes) then you are placing undue stress on the knee and the exercise has been performed incorrectly.",
   "Begin to raise the bar as you exhale by pushing the floor with the heel of your foot as you straighten the legs again and go back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "先把槓鈴調到適合你身高的高度，裝好重量後，走到槓下，把槓鈴放在肩膀後側（脖子稍下方）。",
   "雙手在兩側握住槓鈴（掌心朝前），解開安全鎖，先用腿出力往上推，同時挺直上半身，把槓鈴從架上抬起。",
   "雙腳與肩同寬，腳尖微微朝外。全程抬頭、背部打直，這是起始姿勢。（註：這裡以能全面訓練腿部的中等站距為例，你也可以改用其他站距。）",
   "彎曲膝蓋，慢慢往下蹲，保持抬頭、身體挺直。蹲到大腿與小腿的夾角略小於 90 度（大腿低於水平），下蹲時吸氣。小提醒：姿勢正確時，膝蓋前緣會和腳尖大致在同一條垂直線上；如果膝蓋超出腳尖太多，會讓膝蓋承受過多壓力，代表動作做錯了。",
   "吐氣，用腳跟踩地，把腿伸直站回起始位置。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "leg-press",
  "zh": "腿推機",
  "en": "Leg Press",
  "equip": "machine",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "腳與肩同寬踩在中間，膝蓋不要往內夾、下放別讓下背離開椅墊",
  "steps": [
   "Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a medium (shoulder width) foot stance. (Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances described in the foot positioning section).",
   "Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of you. Tip: Make sure that you do not lock your knees. Your torso and the legs should make a perfect 90-degree angle. This will be your starting position.",
   "As you inhale, slowly lower the platform until your upper and lower legs make a 90-degree angle.",
   "Pushing mainly with the heels of your feet and using the quadriceps go back to the starting position as you exhale.",
   "Repeat for the recommended amount of repetitions and ensure to lock the safety pins properly once you are done. You do not want that platform falling on you fully loaded."
  ],
  "move": "push",
  "stepsZh": [
   "坐上腿推機，雙腳以與肩同寬的中等站距踩在前方踏板上。（註：這裡以能全面訓練腿部的中等站距為例，你也可以改用其他站距。）",
   "放開固定踏板的安全把手，把踏板推到最上方，讓雙腿在前方伸直。小提醒：膝蓋不要鎖死。上半身和雙腿應該成 90 度，這是起始姿勢。",
   "吸氣，慢慢讓踏板往下降，直到大腿與小腿成 90 度。",
   "吐氣，主要用腳跟出力、靠股四頭肌把踏板推回起始位置。",
   "依照建議的次數重複動作。注意：做完一定要把安全把手確實鎖好，避免滿載的踏板壓到你。"
  ]
 },
 {
  "id": "hack-squat",
  "zh": "哈克深蹲機",
  "en": "Hack Squat",
  "equip": "machine",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "背貼靠墊，蹲深一點練大腿前側",
  "steps": [
   "Place the back of your torso against the back pad of the machine and hook your shoulders under the shoulder pads provided.",
   "Position your legs in the platform using a shoulder width medium stance with the toes slightly pointed out. Tip: Keep your head up at all times and also maintain the back on the pad at all times.",
   "Place your arms on the side handles of the machine and disengage the safety bars (which on most designs is done by moving the side handles from a facing front position to a diagonal position).",
   "Now straighten your legs without locking the knees. This will be your starting position. (Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances described in the foot positioning section).",
   "Begin to slowly lower the unit by bending the knees as you maintain a straight posture with the head up (back on the pad at all times). Continue down until the angle between the upper leg and the calves becomes slightly less than 90-degrees (which is the point in which the upper legs are below parallel to the floor). Inhale as you perform this portion of the movement. Tip: If you performed the exercise correctly, the front of the knees should make an imaginary straight line with the toes that is perpendicular to the front. If your knees are past that imaginary line (if they are past your toes) then you are placing undue stress on the knee and the exercise has been performed incorrectly.",
   "Begin to raise the unit as you exhale by pushing the floor with mainly with the heel of your foot as you straighten the legs again and go back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "背部靠在機器的背墊上，肩膀卡進肩墊下方。",
   "雙腳踩在踏板上，與肩同寬，腳尖微微朝外。小提醒：全程抬頭，背部始終貼著背墊。",
   "雙手握住機器兩側的握把，解開安全鎖（多數機型是把側邊握把從朝前轉到斜向）。",
   "把腿伸直，但膝蓋不要鎖死，這是起始姿勢。（註：這裡以能全面訓練腿部的中等站距為例，你也可以改用其他站距。）",
   "彎曲膝蓋，慢慢往下蹲，保持抬頭、背部貼著背墊。蹲到大腿與小腿的夾角略小於 90 度（大腿低於水平），下蹲時吸氣。小提醒：姿勢正確時，膝蓋前緣會和腳尖大致在同一條垂直線上；如果膝蓋超出腳尖太多，會讓膝蓋承受過多壓力，代表動作做錯了。",
   "吐氣，主要用腳跟踩踏板，把腿伸直回到起始位置。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "goblet-squat",
  "zh": "高腳杯深蹲",
  "en": "Goblet Squat",
  "equip": "kettlebell",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "胸前捧著壺鈴或啞鈴，手肘在膝蓋內側往下蹲",
  "steps": [
   "Stand holding a light kettlebell by the horns close to your chest. This will be your starting position.",
   "Squat down between your legs until your hamstrings are on your calves. Keep your chest and head up and your back straight.",
   "At the bottom position, pause and use your elbows to push your knees out. Return to the starting position, and repeat for 10-20 repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "站立，雙手握住輕重量壺鈴的握把兩側，貼近胸前，這是起始姿勢。",
   "往下蹲到兩腿之間，直到大腿後側貼到小腿。保持挺胸抬頭、背部打直。",
   "在最低點稍停，用手肘把膝蓋往外推開。回到起始位置，重複 10～20 次。"
  ]
 },
 {
  "id": "dumbbell-lunges",
  "zh": "啞鈴弓箭步",
  "en": "Dumbbell Lunges",
  "equip": "dumbbell",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "跨大步，後膝快碰地，前膝不超過腳尖太多",
  "steps": [
   "Stand with your torso upright holding two dumbbells in your hands by your sides. This will be your starting position.",
   "Step forward with your right leg around 2 feet or so from the foot being left stationary behind and lower your upper body down, while keeping the torso upright and maintaining balance. Inhale as you go down. Note: As in the other exercises, do not allow your knee to go forward beyond your toes as you come down, as this will put undue stress on the knee joint. Make sure that you keep your front shin perpendicular to the ground.",
   "Using mainly the heel of your foot, push up and go back to the starting position as you exhale.",
   "Repeat the movement for the recommended amount of repetitions and then perform with the left leg."
  ],
  "move": "push",
  "stepsZh": [
   "上半身挺直站好，雙手各拿一個啞鈴垂在身體兩側，這是起始姿勢。",
   "右腳往前跨約 60 公分，後腳留在原地，身體往下降，保持上半身挺直、身體平衡，下降時吸氣。注意：和其他動作一樣，下降時膝蓋不要超過腳尖，否則會讓膝關節承受過多壓力；前腳小腿要和地面垂直。",
   "吐氣，主要用腳跟出力推起，回到起始位置。",
   "依照建議的次數重複動作，再換左腳做。"
  ]
 },
 {
  "id": "barbell-lunge",
  "zh": "槓鈴弓箭步",
  "en": "Barbell Lunge",
  "equip": "barbell",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "槓放上背，步伐穩定，上身保持直立",
  "steps": [
   "This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack just below shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
   "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
   "Step away from the rack and step forward with your right leg and squat down through your hips, while keeping the torso upright and maintaining balance. Inhale as you go down. Note: Do not allow your knee to go forward beyond your toes as you come down, as this will put undue stress on the knee joint. li>",
   "Using mainly the heel of your foot, push up and go back to the starting position as you exhale.",
   "Repeat the movement for the recommended amount of repetitions and then perform with the left leg."
  ],
  "move": "push",
  "stepsZh": [
   "為了安全，建議在深蹲架裡做這個動作。先把槓鈴放在略低於肩膀的高度，調好高度並裝好重量後，走到槓下，把槓鈴放在肩膀後側（脖子稍下方）。",
   "雙手在兩側握住槓鈴，先用腿出力往上推，同時挺直上半身，把槓鈴從架上抬起。",
   "離開深蹲架，右腳往前跨一步，髖部往下蹲，保持上半身挺直、身體平衡，下降時吸氣。注意：下降時膝蓋不要超過腳尖，否則會讓膝關節承受過多壓力。",
   "吐氣，主要用腳跟出力推起，回到起始位置。",
   "依照建議的次數重複動作，再換左腳做。"
  ]
 },
 {
  "id": "bodyweight-squat",
  "zh": "徒手深蹲",
  "en": "Bodyweight Squat",
  "equip": "body",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "屁股往後坐，重心在腳跟，雙手前伸保持平衡",
  "steps": [
   "Stand with your feet shoulder width apart. You can place your hands behind your head. This will be your starting position.",
   "Begin the movement by flexing your knees and hips, sitting back with your hips.",
   "Continue down to full depth if you are able,and quickly reverse the motion until you return to the starting position. As you squat, keep your head and chest up and push your knees out."
  ],
  "move": "push",
  "stepsZh": [
   "雙腳與肩同寬站好，雙手可以放在頭後方，這是起始姿勢。",
   "彎曲膝蓋和髖部，臀部往後坐，開始往下蹲。",
   "能力許可的話蹲到最低，再迅速站回起始位置。下蹲時保持挺胸抬頭，膝蓋往外推。"
  ]
 },
 {
  "id": "leg-extensions",
  "zh": "腿伸展機",
  "en": "Leg Extensions",
  "equip": "machine",
  "primary": [
   "quadriceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "膝蓋對齊機器轉軸，踢直時停一秒擠壓大腿前側",
  "steps": [
   "For this exercise you will need to use a leg extension machine. First choose your weight and sit on the machine with your legs under the pad (feet pointed forward) and the hands holding the side bars. This will be your starting position. Tip: You will need to adjust the pad so that it falls on top of your lower leg (just above your feet). Also, make sure that your legs form a 90-degree angle between the lower and upper leg. If the angle is less than 90-degrees then that means the knee is over the toes which in turn creates undue stress at the knee joint. If the machine is designed that way, either look for another machine or just make sure that when you start executing the exercise you stop going down once you hit the 90-degree angle.",
   "Using your quadriceps, extend your legs to the maximum as you exhale. Ensure that the rest of the body remains stationary on the seat. Pause a second on the contracted position.",
   "Slowly lower the weight back to the original position as you inhale, ensuring that you do not go past the 90-degree angle limit.",
   "Repeat for the recommended amount of times."
  ],
  "move": "push",
  "stepsZh": [
   "這個動作需要使用腿伸展機。先選好重量，坐上機器，小腿放在滾墊下方（腳尖朝前），雙手握住兩側握把，這是起始姿勢。小提醒：調整滾墊，讓它壓在小腿下段（腳踝稍上方）；大腿與小腿要成 90 度。如果角度小於 90 度，膝蓋會超出腳尖，對膝關節造成過多壓力。若機器設計就是這樣，可以換一台，或在動作中下放到 90 度時就停住。",
   "吐氣，用股四頭肌把腿伸到最直，身體其他部位穩坐不動，在收縮位置停 1 秒。",
   "吸氣，慢慢把重量放回原位，注意不要超過 90 度。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "lying-leg-curls",
  "zh": "俯臥腿彎舉",
  "en": "Lying Leg Curls",
  "equip": "machine",
  "primary": [
   "hamstrings"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "髖部貼緊椅墊，勾起後慢慢放下",
  "steps": [
   "Adjust the machine lever to fit your height and lie face down on the leg curl machine with the pad of the lever on the back of your legs (just a few inches under the calves). Tip: Preferably use a leg curl machine that is angled as opposed to flat since an angled position is more favorable for hamstrings recruitment.",
   "Keeping the torso flat on the bench, ensure your legs are fully stretched and grab the side handles of the machine. Position your toes straight (or you can also use any of the other two stances described on the foot positioning section). This will be your starting position.",
   "As you exhale, curl your legs up as far as possible without lifting the upper legs from the pad. Once you hit the fully contracted position, hold it for a second.",
   "As you inhale, bring the legs back to the initial position. Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "依身高調整機器的槓桿，臉朝下趴在腿彎舉機上，讓滾墊壓在小腿後側（小腿肚下方幾公分處）。小提醒：建議選有角度的腿彎舉機，比平的更容易練到大腿後側。",
   "上半身平貼椅墊，雙腿完全伸直，雙手握住機器兩側的握把。腳尖朝正下方（也可以換其他腳尖方向），這是起始姿勢。",
   "吐氣，在大腿不離開椅墊的前提下，盡量把小腿往上彎，到完全收縮時停 1 秒。",
   "吸氣，把腿放回起始位置。依照建議的次數重複動作。"
  ]
 },
 {
  "id": "seated-leg-curl",
  "zh": "坐姿腿彎舉",
  "en": "Seated Leg Curl",
  "equip": "machine",
  "primary": [
   "hamstrings"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "大腿壓板固定好，往下勾到底",
  "steps": [
   "Adjust the machine lever to fit your height and sit on the machine with your back against the back support pad.",
   "Place the back of lower leg on top of padded lever (just a few inches under the calves) and secure the lap pad against your thighs, just above the knees. Then grasp the side handles on the machine as you point your toes straight (or you can also use any of the other two stances) and ensure that the legs are fully straight right in front of you. This will be your starting position.",
   "As you exhale, pull the machine lever as far as possible to the back of your thighs by flexing at the knees. Keep your torso stationary at all times. Hold the contracted position for a second.",
   "Slowly return to the starting position as you breathe in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "依身高調整機器的槓桿，坐上機器，背部靠緊背墊。",
   "把小腿後側放在滾墊上（小腿肚下方幾公分處），把大腿壓墊固定在膝蓋稍上方。雙手握住兩側握把，腳尖朝前（也可以換其他腳尖方向），雙腿在前方完全伸直，這是起始姿勢。",
   "吐氣，彎曲膝蓋，把滾墊盡量往大腿後方壓。上半身全程保持不動，在收縮位置停 1 秒。",
   "吸氣，慢慢回到起始位置。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "romanian-deadlift",
  "zh": "羅馬尼亞硬舉",
  "en": "Romanian Deadlift",
  "equip": "barbell",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "calves",
   "glutes",
   "lower back"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "膝蓋微彎、屁股往後推，槓貼著腿往下到大腿後側有拉扯感",
  "steps": [
   "Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width. Tip: Depending on the weight used, you may need wrist wraps to perform the exercise and also a raised platform in order to allow for better range of motion.",
   "Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.",
   "Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale. Tip: The movement should not be fast but steady and under control.",
   "Once you are standing completely straight up, lower the bar by pushing the hips back, only slightly bending the knees, unlike when squatting. Tip: Take a deep breath at the start of the movement and keep your chest up. Hold your breath as you lower and exhale as you complete the movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "把槓鈴放在身前地上，用比肩略寬的正握（掌心朝下）握住。小提醒：依重量不同，可能需要用拉力帶，也可以站在墊高的平台上做，讓動作幅度更完整。",
   "膝蓋微彎，小腿保持垂直，臀部往後，背部打直，這是起始姿勢。",
   "背部和手臂全程保持打直，吐氣用髖部出力把槓鈴拉起。小提醒：動作不要快，要穩定、有控制。",
   "完全站直後，臀部往後推把槓鈴往下放，膝蓋只微彎，跟深蹲不一樣。小提醒：動作開始前深吸一口氣並挺胸，下放時憋氣，完成動作時再吐氣。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "stiff-legged-barbell-deadlift",
  "zh": "直腿硬舉",
  "en": "Stiff-Legged Barbell Deadlift",
  "equip": "barbell",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "glutes",
   "lower back"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "膝蓋幾乎打直，背保持平直，伸展大腿後側",
  "steps": [
   "Grasp a bar using an overhand grip (palms facing down). You may need some wrist wraps if using a significant amount of weight.",
   "Stand with your torso straight and your legs spaced using a shoulder width or narrower stance. The knees should be slightly bent. This is your starting position.",
   "Keeping the knees stationary, lower the barbell to over the top of your feet by bending at the hips while keeping your back straight. Keep moving forward as if you were going to pick something from the floor until you feel a stretch on the hamstrings. Inhale as you perform this movement.",
   "Start bringing your torso up straight again by extending your hips until you are back at the starting position. Exhale as you perform this movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "用正握（掌心朝下）握住槓鈴。重量較重時可能需要拉力帶。",
   "上半身挺直站好，雙腳與肩同寬或更窄，膝蓋微彎，這是起始姿勢。",
   "膝蓋角度固定不動，背部打直，從髖部往前彎，把槓鈴放到腳背上方。像要從地上撿東西一樣持續往前彎，直到大腿後側有伸展感，下放時吸氣。",
   "吐氣，伸展髖部把上半身挺起，回到起始位置。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "barbell-deadlift",
  "zh": "槓鈴硬舉",
  "en": "Barbell Deadlift",
  "equip": "barbell",
  "primary": [
   "lower back"
  ],
  "secondary": [
   "calves",
   "forearms",
   "glutes",
   "hamstrings",
   "lats",
   "middle back",
   "quadriceps",
   "traps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "槓貼小腿，背打直，用腿推地把槓拉起，站直時夾屁股",
  "steps": [
   "Stand in front of a loaded barbell.",
   "While keeping the back as straight as possible, bend your knees, bend forward and grasp the bar using a medium (shoulder width) overhand grip. This will be the starting position of the exercise. Tip: If it is difficult to hold on to the bar with this grip, alternate your grip or use wrist straps.",
   "While holding the bar, start the lift by pushing with your legs while simultaneously getting your torso to the upright position as you breathe out. In the upright position, stick your chest out and contract the back by bringing the shoulder blades back. Think of how the soldiers in the military look when they are in standing in attention.",
   "Go back to the starting position by bending at the knees while simultaneously leaning the torso forward at the waist while keeping the back straight. When the weights on the bar touch the floor you are back at the starting position and ready to perform another repetition.",
   "Perform the amount of repetitions prescribed in the program."
  ],
  "move": "pull",
  "stepsZh": [
   "站在裝好重量的槓鈴前方。",
   "背部盡量保持打直，彎曲膝蓋、身體前傾，用與肩同寬的正握握住槓鈴，這是起始姿勢。小提醒：如果這樣握不住，可以改用正反握或拉力帶。",
   "握緊槓鈴，吐氣，雙腿用力蹬地，同時把上半身挺直站起。站直時挺胸，肩胛骨往後夾，收緊背部，就像軍人立正的樣子。",
   "彎曲膝蓋，同時從腰部讓上半身前傾，背部保持打直，回到起始位置。槓片碰到地面就回到起始姿勢，可以做下一下。",
   "依照課表的次數重複動作。"
  ]
 },
 {
  "id": "sumo-deadlift",
  "zh": "相撲硬舉",
  "en": "Sumo Deadlift",
  "equip": "barbell",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "adductors",
   "forearms",
   "glutes",
   "lower back",
   "middle back",
   "quadriceps",
   "traps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "雙腳站寬、腳尖外開，手握在兩腿之間",
  "steps": [
   "Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip. Relax the shoulders, which in effect lengthens your arms.",
   "Take a breath, and then lower your hips, looking forward with your head with your chest up. Drive through the floor, spreading your feet apart, with your weight on the back half of your feet. Extend through the hips and knees.",
   "As the bar passes through the knees, lean back and drive the hips into the bar, pulling your shoulder blades together.",
   "Return the weight to the ground by bending at the hips and controlling the weight on the way down."
  ],
  "move": "pull",
  "stepsZh": [
   "槓鈴放在地上，走到槓前，讓槓鈴位在腳掌中段正上方。雙腳站得非常寬，靠近槓片內側。從髖部往下彎去握槓，手臂垂直在肩膀正下方、位於雙腿內側，可用正握、正反握或勾握。肩膀放鬆，讓手臂自然拉長。",
   "吸一口氣，臀部往下沉，抬頭看前方、挺胸。雙腳像要把地板往兩側撐開一樣用力踩地，重心放在腳掌後半部，伸展髖部和膝蓋。",
   "槓鈴經過膝蓋後，身體往後挺，髖部往槓鈴方向推，同時夾緊肩胛骨。",
   "從髖部往下彎，控制重量慢慢放回地面。"
  ]
 },
 {
  "id": "barbell-hip-thrust",
  "zh": "槓鈴臀推",
  "en": "Barbell Hip Thrust",
  "equip": "barbell",
  "primary": [
   "glutes"
  ],
  "secondary": [
   "calves",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "上背靠椅，槓放髖部，往上推到身體成一直線",
  "steps": [
   "Begin seated on the ground with a bench directly behind you. Have a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused by this exercise.",
   "Roll the bar so that it is directly above your hips, and lean back against the bench so that your shoulder blades are near the top of it.",
   "Begin the movement by driving through your feet, extending your hips vertically through the bar. Your weight should be supported by your shoulder blades and your feet. Extend as far as possible, then reverse the motion to return to the starting position."
  ],
  "move": "push",
  "stepsZh": [
   "坐在地上，臥推椅緊貼在背後，裝好重量的槓鈴放在雙腿上。使用較粗的槓或在槓上加護墊，可以大幅減少不適感。",
   "把槓鈴滾到髖部正上方，上背靠在臥推椅上，讓肩胛骨大約在椅子邊緣。",
   "雙腳踩地出力，把髖部垂直往上推起槓鈴，用肩胛骨和雙腳支撐體重。推到最高點後，反向做回起始位置。"
  ]
 },
 {
  "id": "barbell-glute-bridge",
  "zh": "槓鈴臀橋",
  "en": "Barbell Glute Bridge",
  "equip": "barbell",
  "primary": [
   "glutes"
  ],
  "secondary": [
   "calves",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "躺地上做臀推，頂點夾緊屁股",
  "steps": [
   "Begin seated on the ground with a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused by this exercise. Roll the bar so that it is directly above your hips, and lay down flat on the floor.",
   "Begin the movement by driving through with your heels, extending your hips vertically through the bar. Your weight should be supported by your upper back and the heels of your feet.",
   "Extend as far as possible, then reverse the motion to return to the starting position."
  ],
  "move": "push",
  "stepsZh": [
   "坐在地上，裝好重量的槓鈴放在雙腿上。使用較粗的槓或在槓上加護墊，可以大幅減少不適感。把槓鈴滾到髖部正上方，然後平躺在地上。",
   "用腳跟踩地出力，把髖部垂直往上推起槓鈴，用上背和腳跟支撐體重。",
   "推到最高點後，反向做回起始位置。"
  ]
 },
 {
  "id": "butt-lift-bridge",
  "zh": "臀橋",
  "en": "Butt Lift (Bridge)",
  "equip": "body",
  "primary": [
   "glutes"
  ],
  "secondary": [
   "hamstrings"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "躺著屈膝，把屁股抬起到肩膀、髖、膝一直線",
  "steps": [
   "Lie flat on the floor on your back with the hands by your side and your knees bent. Your feet should be placed around shoulder width. This will be your starting position.",
   "Pushing mainly with your heels, lift your hips off the floor while keeping your back straight. Breathe out as you perform this part of the motion and hold at the top for a second.",
   "Slowly go back to the starting position as you breathe in."
  ],
  "move": "push",
  "stepsZh": [
   "仰躺在地上，雙手放在身體兩側，膝蓋彎曲，雙腳約與肩同寬，這是起始姿勢。",
   "主要用腳跟出力，把臀部抬離地面，背部保持打直。抬起時吐氣，在頂端停 1 秒。",
   "吸氣，慢慢回到起始位置。"
  ]
 },
 {
  "id": "standing-calf-raises",
  "zh": "站姿提踵",
  "en": "Standing Calf Raises",
  "equip": "machine",
  "primary": [
   "calves"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "腳跟往下到底再踮到最高，慢慢做",
  "steps": [
   "Adjust the padded lever of the calf raise machine to fit your height.",
   "Place your shoulders under the pads provided and position your toes facing forward (or using any of the two other positions described at the beginning of the chapter). The balls of your feet should be secured on top of the calf block with the heels extending off it. Push the lever up by extending your hips and knees until your torso is standing erect. The knees should be kept with a slight bend; never locked. Toes should be facing forward, outwards or inwards as described at the beginning of the chapter. This will be your starting position.",
   "Raise your heels as you breathe out by extending your ankles as high as possible and flexing your calf. Ensure that the knee is kept stationary at all times. There should be no bending at any time. Hold the contracted position by a second before you start to go back down.",
   "Go back slowly to the starting position as you breathe in by lowering your heels as you bend the ankles until calves are stretched.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "依身高調整提踵機的肩墊高度。",
   "肩膀放到肩墊下方，前腳掌踩穩在踏台上、腳跟懸空，腳尖朝前（也可以朝外或朝內）。伸展髖部和膝蓋把肩墊頂起，讓身體站直。膝蓋保持微彎，不要鎖死，這是起始姿勢。",
   "吐氣，腳踝盡量往上伸，把腳跟抬到最高、收緊小腿。膝蓋全程不動、不要彎曲，在收縮位置停 1 秒再往下。",
   "吸氣，彎曲腳踝慢慢放下腳跟，直到小腿有伸展感，回到起始位置。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "seated-calf-raise",
  "zh": "坐姿提踵",
  "en": "Seated Calf Raise",
  "equip": "machine",
  "primary": [
   "calves"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "膝蓋彎曲時練到比目魚肌",
  "steps": [
   "Sit on the machine and place your toes on the lower portion of the platform provided with the heels extending off. Choose the toe positioning of your choice (forward, in, or out) as per the beginning of this chapter.",
   "Place your lower thighs under the lever pad, which will need to be adjusted according to the height of your thighs. Now place your hands on top of the lever pad in order to prevent it from slipping forward.",
   "Lift the lever slightly by pushing your heels up and release the safety bar. This will be your starting position.",
   "Slowly lower your heels by bending at the ankles until the calves are fully stretched. Inhale as you perform this movement.",
   "Raise the heels by extending the ankles as high as possible as you contract the calves and breathe out. Hold the top contraction for a second.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "坐上機器，前腳掌踩在踏板下緣、腳跟懸空。腳尖方向可依需要選擇朝前、朝內或朝外。",
   "把大腿下段放到壓墊下方，依大腿厚度調整壓墊高度，雙手扶在壓墊上，避免它往前滑。",
   "腳跟往上推，把壓墊稍微頂起，解開安全桿，這是起始姿勢。",
   "吸氣，彎曲腳踝慢慢放下腳跟，直到小腿完全伸展。",
   "吐氣，收緊小腿，腳踝盡量往上伸把腳跟抬高，在頂端停 1 秒。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "thigh-adductor",
  "zh": "大腿內收機",
  "en": "Thigh Adductor",
  "equip": "machine",
  "primary": [
   "adductors"
  ],
  "secondary": [
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "雙腿往內夾，回放時慢慢控制",
  "steps": [
   "To begin, sit down on the adductor machine and select a weight you are comfortable with. When your legs are positioned properly on the leg pads of the machine, grip the handles on each side. Your entire upper body (from the waist up) should be stationary. This is the starting position.",
   "Slowly press against the machine with your legs to move them towards each other while exhaling.",
   "Feel the contraction for a second and begin to move your legs back to the starting position while breathing in. Note: Remember to keep your upper body stationary and avoid fast jerking motions in order to prevent any injuries from occurring.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "坐上大腿內收機，選一個你能掌控的重量。雙腿在腿墊上放好後，雙手握住兩側握把，腰部以上全程保持不動，這是起始姿勢。",
   "吐氣，雙腿慢慢往內夾，讓兩腿靠攏。",
   "感受收縮 1 秒，再吸氣讓雙腿回到起始位置。注意：上半身保持不動，避免用甩的或太快的動作，以免受傷。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "thigh-abductor",
  "zh": "大腿外展機",
  "en": "Thigh Abductor",
  "equip": "machine",
  "primary": [
   "abductors"
  ],
  "secondary": [
   "glutes"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "雙腿往外推，練臀部側邊",
  "steps": [
   "To begin, sit down on the abductor machine and select a weight you are comfortable with. When your legs are positioned properly, grip the handles on each side. Your entire upper body (from the waist up) should be stationary. This is the starting position.",
   "Slowly press against the machine with your legs to move them away from each other while exhaling.",
   "Feel the contraction for a second and begin to move your legs back to the starting position while breathing in. Note: Remember to keep your upper body stationary to prevent any injuries from occurring.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "坐上大腿外展機，選一個你能掌控的重量。雙腿放好後，雙手握住兩側握把，腰部以上全程保持不動，這是起始姿勢。",
   "吐氣，雙腿慢慢往外推開。",
   "感受收縮 1 秒，再吸氣讓雙腿回到起始位置。注意：上半身保持不動，以免受傷。",
   "依照建議的次數重複動作。"
  ]
 },
 {
  "id": "split-squat-with-dumbbells",
  "zh": "啞鈴分腿蹲",
  "en": "Split Squat with Dumbbells",
  "equip": "dumbbell",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "前後腳固定不動，垂直往下蹲",
  "steps": [
   "Position yourself into a staggered stance with the rear foot elevated and front foot forward.",
   "Hold a dumbbell in each hand, letting them hang at the sides. This will be your starting position.",
   "Begin by descending, flexing your knee and hip to lower your body down. Maintain good posture througout the movement. Keep the front knee in line with the foot as you perform the exercise.",
   "At the bottom of the movement, drive through the heel to extend the knee and hip to return to the starting position."
  ],
  "move": "push",
  "stepsZh": [
   "前後分腿站立，後腳墊高，前腳在前。",
   "雙手各拿一個啞鈴，自然垂在身體兩側，這是起始姿勢。",
   "彎曲膝蓋和髖部，讓身體往下降。全程保持良好姿勢，前腳膝蓋與腳尖方向一致。",
   "到最低點後，用腳跟出力伸展膝蓋和髖部，回到起始位置。"
  ]
 },
 {
  "id": "dumbbell-step-ups",
  "zh": "啞鈴登階",
  "en": "Dumbbell Step Ups",
  "equip": "dumbbell",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "用前腳的力量踩上箱子，不要用後腳蹬",
  "steps": [
   "Stand up straight while holding a dumbbell on each hand (palms facing the side of your legs).",
   "Place the right foot on the elevated platform. Step on the platform by extending the hip and the knee of your right leg. Use the heel mainly to lift the rest of your body up and place the foot of the left leg on the platform as well. Breathe out as you execute the force required to come up.",
   "Step down with the left leg by flexing the hip and knee of the right leg as you inhale. Return to the original standing position by placing the right foot of to next to the left foot on the initial position.",
   "Repeat with the right leg for the recommended amount of repetitions and then perform with the left leg."
  ],
  "move": "push",
  "stepsZh": [
   "身體站直，雙手各拿一個啞鈴（掌心朝向大腿外側）。",
   "右腳踩上墊高的平台，伸展右腳的髖部和膝蓋站上去，主要用腳跟出力把身體撐上去，再把左腳也放上平台。往上時吐氣。",
   "吸氣，彎曲右腳的髖部和膝蓋，左腳先往下踩回地面，接著右腳也放回左腳旁邊，回到起始站姿。",
   "右腳依照建議的次數做完，再換左腳做。"
  ]
 },
 {
  "id": "kettlebell-one-legged-deadlift",
  "zh": "壺鈴單腳硬舉",
  "en": "Kettlebell One-Legged Deadlift",
  "equip": "kettlebell",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "glutes",
   "lower back"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "單腳站，身體與後腳一起往前倒成 T 字",
  "steps": [
   "Hold a kettlebell by the handle in one hand. Stand on one leg, on the same side that you hold the kettlebell.",
   "Keeping that knee slightly bent, perform a stiff legged deadlift by bending at the hip, extending your free leg behind you for balance.",
   "Continue lowering the kettlebell until you are parallel to the ground, and then return to the upright position."
  ],
  "move": "pull",
  "stepsZh": [
   "單手握住壺鈴握把，用與持鈴手同側的腳單腳站立。",
   "支撐腳膝蓋微彎，從髖部往前彎做直腿硬舉，另一腳往後伸直幫助平衡。",
   "持續把壺鈴往下放，直到上半身與地面平行，再回到站直姿勢。"
  ]
 },
 {
  "id": "pullups",
  "zh": "引體向上",
  "en": "Pullups",
  "equip": "body",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "先把肩胛往下拉，再把胸口拉向單槓",
  "steps": [
   "Grab the pull-up bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than your shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.",
   "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.",
   "Pull your torso up until the bar touches your upper chest by drawing the shoulders and the upper arms down and back. Exhale as you perform this portion of the movement. Tip: Concentrate on squeezing the back muscles once you reach the full contracted position. The upper torso should remain stationary as it moves through space and only the arms should move. The forearms should do no other work other than hold the bar.",
   "After a second on the contracted position, start to inhale and slowly lower your torso back to the starting position when your arms are fully extended and the lats are fully stretched.",
   "Repeat this motion for the prescribed amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "依課表指定的握距，掌心朝前握住單槓。握距說明：寬握是雙手距離比肩寬；中握是與肩同寬；窄握是比肩窄。",
   "雙臂伸直握住單槓，上半身往後傾約 30 度，下背微微拱起、挺胸，這是起始姿勢。",
   "吐氣，把肩膀和上臂往下、往後拉，將身體拉起，直到槓碰到上胸。小提醒：到達完全收縮位置時，專心夾緊背肌。上半身姿勢固定，只有手臂在動；前臂只負責握槓，不要用前臂出力。",
   "在收縮位置停 1 秒，吸氣，慢慢把身體放回起始位置，直到手臂完全伸直、背闊肌完全伸展。",
   "依照課表的次數重複動作。"
  ]
 },
 {
  "id": "chin-up",
  "zh": "反手引體向上",
  "en": "Chin-Up",
  "equip": "body",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "forearms",
   "middle back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "掌心朝自己，比較好出力、手臂參與較多",
  "steps": [
   "Grab the pull-up bar with the palms facing your torso and a grip closer than the shoulder width.",
   "As you have both arms extended in front of you holding the bar at the chosen grip width, keep your torso as straight as possible while creating a curvature on your lower back and sticking your chest out. This is your starting position. Tip: Keeping the torso as straight as possible maximizes biceps stimulation while minimizing back involvement.",
   "As you breathe out, pull your torso up until your head is around the level of the pull-up bar. Concentrate on using the biceps muscles in order to perform the movement. Keep the elbows close to your body. Tip: The upper torso should remain stationary as it moves through space and only the arms should move. The forearms should do no other work other than hold the bar.",
   "After a second of squeezing the biceps in the contracted position, slowly lower your torso back to the starting position; when your arms are fully extended. Breathe in as you perform this portion of the movement.",
   "Repeat this motion for the prescribed amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "掌心朝向自己握住單槓，握距比肩窄。",
   "雙臂伸直握住單槓，上半身盡量保持挺直，下背微微拱起、挺胸，這是起始姿勢。小提醒：上半身越直，越能練到二頭，減少背部參與。",
   "吐氣，把身體往上拉，直到頭部大約與單槓同高。專心用二頭出力，手肘貼近身體。小提醒：上半身姿勢固定，只有手臂在動；前臂只負責握槓。",
   "在收縮位置夾緊二頭 1 秒後，吸氣，慢慢把身體放回起始位置，直到手臂完全伸直。",
   "依照課表的次數重複動作。"
  ]
 },
 {
  "id": "wide-grip-lat-pulldown",
  "zh": "寬握滑輪下拉",
  "en": "Wide-Grip Lat Pulldown",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "握把拉到上胸，手肘往下往後，不要用身體甩",
  "steps": [
   "Sit down on a pull-down machine with a wide bar attached to the top pulley. Make sure that you adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
   "Grab the bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.",
   "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.",
   "As you breathe out, bring the bar down until it touches your upper chest by drawing the shoulders and the upper arms down and back. Tip: Concentrate on squeezing the back muscles once you reach the full contracted position. The upper torso should remain stationary and only the arms should move. The forearms should do no other work except for holding the bar; therefore do not try to pull down the bar using the forearms.",
   "After a second at the contracted position squeezing your shoulder blades together, slowly raise the bar back to the starting position when your arms are fully extended and the lats are fully stretched. Inhale during this portion of the movement.",
   "Repeat this motion for the prescribed amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "坐上滑輪下拉機，上方滑輪掛上長直桿。依身高調整膝墊，防止身體被重量往上拉起。",
   "依課表指定的握距，掌心朝前握住直桿。握距說明：寬握是雙手距離比肩寬；中握是與肩同寬；窄握是比肩窄。",
   "雙臂伸直握住直桿，上半身往後傾約 30 度，下背微微拱起、挺胸，這是起始姿勢。",
   "吐氣，把肩膀和上臂往下、往後拉，將直桿拉到碰到上胸。小提醒：到達完全收縮位置時，專心夾緊背肌。上半身保持不動，只有手臂在動；前臂只負責握桿，不要用前臂往下拉。",
   "在收縮位置夾緊肩胛骨 1 秒，吸氣，慢慢讓直桿回到起始位置，直到手臂完全伸直、背闊肌完全伸展。",
   "依照課表的次數重複動作。"
  ]
 },
 {
  "id": "close-grip-front-lat-pulldown",
  "zh": "窄握滑輪下拉",
  "en": "Close-Grip Front Lat Pulldown",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "用窄握把拉到胸前，練背闊肌下半部",
  "steps": [
   "Sit down on a pull-down machine with a wide bar attached to the top pulley. Make sure that you adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
   "Grab the bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than your shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.",
   "As you have both arms extended in front of you - while holding the bar at the chosen grip width - bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.",
   "As you breathe out, bring the bar down until it touches your upper chest by drawing the shoulders and the upper arms down and back. Tip: Concentrate on squeezing the back muscles once you reach the full contracted position. The upper torso should remain stationary (only the arms should move). The forearms should do no other work except for holding the bar; therefore do not try to pull the bar down using the forearms.",
   "After a second in the contracted position, while squeezing your shoulder blades together, slowly raise the bar back to the starting position when your arms are fully extended and the lats are fully stretched. Inhale during this portion of the movement.",
   "6. Repeat this motion for the prescribed amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "坐上滑輪下拉機，上方滑輪接上長直桿。依身高調整大腿護墊，護墊可以避免重量把身體往上拉起。",
   "掌心朝前，用指定的握距握住直桿。握距說明：寬握是雙手距離比肩寬；中握是與肩同寬；窄握則比肩窄。",
   "雙臂向前上方伸直、維持選好的握距，上半身往後倒約 30 度，下背微微拱起、挺胸。這是起始姿勢。",
   "吐氣，把肩膀和上臂往下、往後帶，將直桿拉到碰到上胸。小提醒：拉到底時專心夾緊背部肌肉。上半身保持不動，只有手臂在動。前臂只負責握住直桿，不要用前臂硬拉。",
   "在收縮位置停 1 秒、夾緊肩胛骨，接著慢慢讓直桿回到起始位置，直到手臂完全伸直、背闊肌充分伸展。這個過程吸氣。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "seated-cable-rows",
  "zh": "坐姿划船",
  "en": "Seated Cable Rows",
  "equip": "cable",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "biceps",
   "lats",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "背挺直，把握把拉到肚子，肩胛往後夾",
  "steps": [
   "For this exercise you will need access to a low pulley row machine with a V-bar. Note: The V-bar will enable you to have a neutral grip where the palms of your hands face each other. To get into the starting position, first sit down on the machine and place your feet on the front platform or crossbar provided making sure that your knees are slightly bent and not locked.",
   "Lean over as you keep the natural alignment of your back and grab the V-bar handles.",
   "With your arms extended pull back until your torso is at a 90-degree angle from your legs. Your back should be slightly arched and your chest should be sticking out. You should be feeling a nice stretch on your lats as you hold the bar in front of you. This is the starting position of the exercise.",
   "Keeping the torso stationary, pull the handles back towards your torso while keeping the arms close to it until you touch the abdominals. Breathe out as you perform that movement. At that point you should be squeezing your back muscles hard. Hold that contraction for a second and slowly go back to the original position while breathing in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "這個動作需要低位滑輪划船機和 V 型把。注意：V 型把能讓你用掌心相對的對握。坐上機器，雙腳踩在前方踏板或橫桿上，膝蓋微彎、不要鎖死。",
   "身體前傾、保持背部自然弧度，握住 V 型把。",
   "手臂伸直，把上半身往後拉到與雙腿呈 90 度。背部微拱、挺胸，握著把手時應該感覺背闊肌被伸展開。這是起始姿勢。",
   "上半身保持不動，手臂貼近身體，把握把往身體拉到碰到腹部，同時吐氣。這時要用力夾緊背部肌肉，停 1 秒，再一邊吸氣一邊慢慢回到起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "bent-over-barbell-row",
  "zh": "槓鈴俯身划船",
  "en": "Bent Over Barbell Row",
  "equip": "barbell",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "biceps",
   "lats",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "上身前傾約 45 度，槓拉向肚臍",
  "steps": [
   "Holding a barbell with a pronated grip (palms facing down), bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The barbell should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.",
   "Now, while keeping the torso stationary, breathe out and lift the barbell to you. Keep the elbows close to the body and only use the forearms to hold the weight. At the top contracted position, squeeze the back muscles and hold for a brief pause.",
   "Then inhale and slowly lower the barbell back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "正握（掌心朝下）握住槓鈴，膝蓋微彎，從髖部向前彎腰，背部保持平直，直到上半身幾乎與地面平行。小提醒：頭要抬起來。槓鈴垂在身體正前方，手臂與地面和上半身垂直。這是起始姿勢。",
   "上半身保持不動，吐氣把槓鈴往身體拉。手肘貼近身體，前臂只負責握住重量。拉到頂端時夾緊背部肌肉，稍停一下。",
   "接著吸氣，慢慢把槓鈴放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "one-arm-dumbbell-row",
  "zh": "單手啞鈴划船",
  "en": "One-Arm Dumbbell Row",
  "equip": "dumbbell",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "biceps",
   "lats",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "一手一膝撐在椅上，手肘往後上方拉",
  "steps": [
   "Choose a flat bench and place a dumbbell on each side of it.",
   "Place the right leg on top of the end of the bench, bend your torso forward from the waist until your upper body is parallel to the floor, and place your right hand on the other end of the bench for support.",
   "Use the left hand to pick up the dumbbell on the floor and hold the weight while keeping your lower back straight. The palm of the hand should be facing your torso. This will be your starting position.",
   "Pull the resistance straight up to the side of your chest, keeping your upper arm close to your side and keeping the torso stationary. Breathe out as you perform this step. Tip: Concentrate on squeezing the back muscles once you reach the full contracted position. Also, make sure that the force is performed with the back muscles and not the arms. Finally, the upper torso should remain stationary and only the arms should move. The forearms should do no other work except for holding the dumbbell; therefore do not try to pull the dumbbell up using the forearms.",
   "Lower the resistance straight down to the starting position. Breathe in as you perform this step.",
   "Repeat the movement for the specified amount of repetitions.",
   "Switch sides and repeat again with the other arm."
  ],
  "move": "pull",
  "stepsZh": [
   "準備一張平板臥推椅，兩側各放一個啞鈴。",
   "右膝跪在臥推椅一端，從髖部往前彎腰到上半身與地面平行，右手撐在椅子另一端支撐身體。",
   "用左手拿起地上的啞鈴，下背保持平直，掌心朝向身體。這是起始姿勢。",
   "吐氣，把啞鈴直直往上拉到胸部側邊，上臂貼近身體，上半身保持不動。小提醒：拉到頂時專心夾緊背部，要用背部肌肉發力而不是手臂。上半身不要動，只有手臂在動；前臂只負責握住啞鈴，不要用前臂把啞鈴往上拉。",
   "吸氣，把啞鈴直直放回起始位置。",
   "依指定次數重複動作。",
   "換邊，用另一隻手再做一次。"
  ]
 },
 {
  "id": "t-bar-row-with-handle",
  "zh": "T 槓划船",
  "en": "T-Bar Row with Handle",
  "equip": "barbell",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "biceps",
   "lats"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "胸口挺起，把槓拉向胸口下緣",
  "steps": [
   "Position a bar into a landmine or in a corner to keep it from moving. Load an appropriate weight onto your end.",
   "Stand over the bar, and position a Double D row handle around the bar next to the collar. Using your hips and legs, rise to a standing position.",
   "Assume a wide stance with your hips back and your chest up. Your arms should be extended. This will be your starting position.",
   "Pull the weight to your upper abdomen by retracting the shoulder blades and flexing the elbows. Do not jerk the weight or cheat during the movement.",
   "After a brief pause, return to the starting position."
  ],
  "move": "pull",
  "stepsZh": [
   "把槓鈴一端插進地雷管或卡在牆角固定，另一端裝上適當的重量。",
   "跨站在槓鈴上方，把雙 D 型划船握把套在槓上、靠近卡扣的位置。用髖部和腿部的力量站起來。",
   "雙腳站寬，臀部往後推、挺胸，手臂伸直。這是起始姿勢。",
   "收緊肩胛骨、彎曲手肘，把重量拉到上腹部。過程中不要甩動或借力。",
   "稍停一下，再回到起始姿勢。"
  ]
 },
 {
  "id": "lying-t-bar-row",
  "zh": "俯臥 T 槓划船",
  "en": "Lying T-Bar Row",
  "equip": "machine",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "biceps",
   "lats"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "胸貼靠墊，避免借力，專心用背拉",
  "steps": [
   "Load up the T-bar Row Machine with the desired weight and adjust the leg height so that your upper chest is at the top of the pad. Tip: In some machines all you can do is stand on the appropriate step that allows you to be at a height that has the upper chest at the top of the pad.",
   "Lay face down on the pad and grab the handles. You can either use a palms down, palms up, or palms in position depending on what part of your back you want to emphasize.",
   "Lift the bar off the rack and extend your arms in front of you. This will be your starting position.",
   "As you exhale slowly pull the weight up and squeeze your back at the top of the movement. Tip: Keep the upper arms as close to the torso as possible throughout the movement in order to better engage the back muscles. Also, do not lift your body off of the pad at any time and refrain from using the biceps to lift the weight.",
   "After a second contraction at the top of the movement, as you inhale, slowly go back down to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "在 T 槓划船機上裝好重量，調整踏板高度，讓上胸剛好位於靠墊頂端。小提醒：有些機器只能靠選擇合適的踏階來調整高度。",
   "趴在靠墊上握住握把。可以選正握、反握或對握，依你想加強的背部區域而定。",
   "把槓從架上抬起，手臂向前伸直。這是起始姿勢。",
   "吐氣，慢慢把重量往上拉，到頂時夾緊背部。小提醒：全程上臂盡量貼近身體，更能用到背部肌肉。身體不要離開靠墊，也不要用二頭出力拉。",
   "在頂端收縮 1 秒後，吸氣慢慢放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "straight-arm-pulldown",
  "zh": "直臂下拉",
  "en": "Straight-Arm Pulldown",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手臂伸直往下壓到大腿，感受背闊肌",
  "steps": [
   "You will start by grabbing the wide bar from the top pulley of a pulldown machine and using a wider than shoulder-width pronated (palms down) grip. Step backwards two feet or so.",
   "Bend your torso forward at the waist by around 30-degrees with your arms fully extended in front of you and a slight bend at the elbows. If your arms are not fully extended then you need to step a bit more backwards until they are. Once your arms are fully extended and your torso is slightly bent at the waist, tighten the lats and then you are ready to begin.",
   "While keeping the arms straight, pull the bar down by contracting the lats until your hands are next to the side of the thighs. Breathe out as you perform this step.",
   "While keeping the arms straight, go back to the starting position while breathing in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "在滑輪下拉機上方滑輪接上長直桿，以比肩寬的正握（掌心朝下）握住，往後退約 60 公分。",
   "上半身從髖部前傾約 30 度，手臂向前伸直、手肘微彎。如果手臂沒辦法完全伸直，就再往後退一點。手臂伸直、上身微前傾後，先收緊背闊肌，就可以開始。",
   "手臂保持伸直，用背闊肌發力把直桿往下拉，直到雙手來到大腿兩側，同時吐氣。",
   "手臂保持伸直，一邊吸氣一邊回到起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "hyperextensions-back-extensions",
  "zh": "背部伸展（羅馬椅）",
  "en": "Hyperextensions (Back Extensions)",
  "equip": "body",
  "primary": [
   "lower back"
  ],
  "secondary": [
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "身體往下再抬到一直線，不要過度後仰",
  "steps": [
   "Lie face down on a hyperextension bench, tucking your ankles securely under the footpads.",
   "Adjust the upper pad if possible so your upper thighs lie flat across the wide pad, leaving enough room for you to bend at the waist without any restriction.",
   "With your body straight, cross your arms in front of you (my preference) or behind your head. This will be your starting position. Tip: You can also hold a weight plate for extra resistance in front of you under your crossed arms.",
   "Start bending forward slowly at the waist as far as you can while keeping your back flat. Inhale as you perform this movement. Keep moving forward until you feel a nice stretch on the hamstrings and you can no longer keep going without a rounding of the back. Tip: Never round the back as you perform this exercise. Also, some people can go farther than others. The key thing is that you go as far as your body allows you to without rounding the back.",
   "Slowly raise your torso back to the initial position as you inhale. Tip: Avoid the temptation to arch your back past a straight line. Also, do not swing the torso at any time in order to protect the back from injury.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "臉朝下趴在羅馬椅上，腳踝穩穩勾在腳墊下方。",
   "如果可以調整，把上方墊子調到讓大腿上段平貼在寬墊上，並留出足夠空間讓腰部能自由彎曲。",
   "身體打直，雙手交叉放在胸前或放在頭後。這是起始姿勢。小提醒：想加強度，可以在交叉的手臂下抱一片槓片。",
   "吸氣，從髖部慢慢向前彎，盡量往下但背部保持平直。彎到大腿後側有明顯伸展感、再往下就會駝背為止。小提醒：做這個動作絕對不要駝背。每個人能彎的幅度不同，重點是在不駝背的前提下做到身體允許的範圍。",
   "慢慢把上半身抬回起始位置。小提醒：不要把背往後拱超過一直線，也不要甩動上身，以免受傷。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "leverage-high-row",
  "zh": "高位划船機",
  "en": "Leverage High Row",
  "equip": "machine",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "lats"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "由上往下後方拉，手肘貼近身體",
  "steps": [
   "Load an appropriate weight onto the pins and adjust the seat height so that you can just reach the handles above you. Adjust the knee pad to help keep you down. Grasp the handles with a pronated grip. This will be your starting position.",
   "Pull the handles towards your torso, retracting your shoulder blades as you flex the elbow.",
   "Pause at the bottom of the motion, and then slowly return the handles to the starting position.",
   "For multiple repetitions, avoid completely returning the weight to the stops to keep tension on the muscles being worked."
  ],
  "move": "pull",
  "stepsZh": [
   "在插銷上設定適當重量，調整座椅高度到剛好能搆到上方的握把。調整膝蓋護墊幫助身體固定。以正握握住握把。這是起始姿勢。",
   "彎曲手肘、收緊肩胛骨，把握把往身體方向拉。",
   "在最低點稍停，再慢慢讓握把回到起始位置。",
   "連續做多次時，不要讓重量完全放回底部，保持肌肉持續受力。"
  ]
 },
 {
  "id": "reverse-flyes",
  "zh": "反向飛鳥",
  "en": "Reverse Flyes",
  "equip": "dumbbell",
  "primary": [
   "shoulders"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上身前傾，雙手往兩側打開，練後肩",
  "steps": [
   "To begin, lie down on an incline bench with the chest and stomach pressing against the incline. Have the dumbbells in each hand with the palms facing each other (neutral grip).",
   "Extend the arms in front of you so that they are perpendicular to the angle of the bench. The legs should be stationary while applying pressure with the ball of your toes. This is the starting position.",
   "Maintaining the slight bend of the elbows, move the weights out and away from each other (to the side) in an arc motion while exhaling. Tip: Try to squeeze your shoulder blades together to get the best results from this exercise.",
   "The arms should be elevated until they are parallel to the floor.",
   "Feel the contraction and slowly lower the weights back down to the starting position while inhaling.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "趴在上斜臥推椅上，胸口和肚子貼著椅背。雙手各拿一個啞鈴，掌心相對（對握）。",
   "手臂往前伸直，與椅面呈垂直。雙腿保持不動，用前腳掌踩穩地面。這是起始姿勢。",
   "手肘維持微彎，吐氣把啞鈴往兩側畫弧打開。小提醒：試著夾緊肩胛骨，效果最好。",
   "手臂抬到與地面平行。",
   "感受收縮後，吸氣慢慢把啞鈴放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "face-pull",
  "zh": "繩索面拉",
  "en": "Face Pull",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "middle back"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "繩索拉向臉，手肘高、往兩側打開",
  "steps": [
   "Facing a high pulley with a rope or dual handles attached, pull the weight directly towards your face, separating your hands as you do so. Keep your upper arms parallel to the ground."
  ],
  "move": "pull",
  "stepsZh": [
   "面向高位滑輪，接上繩索或雙握把，把重量直接拉向臉部，同時雙手往兩側分開。上臂保持與地面平行。"
  ]
 },
 {
  "id": "inverted-row",
  "zh": "反式划船",
  "en": "Inverted Row",
  "equip": "body",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "lats"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "身體在槓下一直線，把胸口拉向槓",
  "steps": [
   "Position a bar in a rack to about waist height. You can also use a smith machine.",
   "Take a wider than shoulder width grip on the bar and position yourself hanging underneath the bar. Your body should be straight with your heels on the ground with your arms fully extended. This will be your starting position.",
   "Begin by flexing the elbow, pulling your chest towards the bar. Retract your shoulder blades as you perform the movement.",
   "Pause at the top of the motion, and return yourself to the start position.",
   "Repeat for the desired number of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "把槓鈴放在架上約腰部高度，也可以用史密斯機。",
   "以比肩寬的握距握住槓，身體懸在槓下方。身體打直、腳跟著地、手臂伸直。這是起始姿勢。",
   "彎曲手肘，把胸口拉向槓，過程中收緊肩胛骨。",
   "在頂端稍停，再回到起始位置。",
   "依想要的次數重複動作。"
  ]
 },
 {
  "id": "barbell-shoulder-press",
  "zh": "槓鈴肩推",
  "en": "Barbell Shoulder Press",
  "equip": "barbell",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "chest",
   "triceps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "核心收緊，槓從鎖骨推到頭頂，頭稍微往後讓路",
  "steps": [
   "Sit on a bench with back support in a squat rack. Position a barbell at a height that is just above your head. Grab the barbell with a pronated grip (palms facing forward).",
   "Once you pick up the barbell with the correct grip width, lift the bar up over your head by locking your arms. Hold at about shoulder level and slightly in front of your head. This is your starting position.",
   "Lower the bar down to the shoulders slowly as you inhale.",
   "Lift the bar back up to the starting position as you exhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "坐在深蹲架內有靠背的椅子上，把槓鈴放在比頭頂略高的位置。以正握（掌心朝前）握住槓鈴。",
   "用正確握距拿起槓鈴後，手臂伸直把槓推到頭頂上方，位置略在頭部前方。這是起始姿勢。",
   "吸氣，慢慢把槓放到肩膀高度。",
   "吐氣，把槓推回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "dumbbell-shoulder-press",
  "zh": "啞鈴肩推",
  "en": "Dumbbell Shoulder Press",
  "equip": "dumbbell",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "啞鈴從耳朵高度推到頭頂，不要聳肩",
  "steps": [
   "While holding a dumbbell in each hand, sit on a military press bench or utility bench that has back support. Place the dumbbells upright on top of your thighs.",
   "Now raise the dumbbells to shoulder height one at a time using your thighs to help propel them up into position.",
   "Make sure to rotate your wrists so that the palms of your hands are facing forward. This is your starting position.",
   "Now, exhale and push the dumbbells upward until they touch at the top.",
   "Then, after a brief pause at the top contracted position, slowly lower the weights back down to the starting position while inhaling.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "雙手各拿一個啞鈴，坐在有靠背的推肩椅或可調式椅上，把啞鈴直立放在大腿上。",
   "利用大腿往上頂的力量，一次一個把啞鈴舉到肩膀高度。",
   "轉動手腕讓掌心朝前。這是起始姿勢。",
   "吐氣，把啞鈴往上推到頂端互相輕碰。",
   "在頂端稍停，再吸氣慢慢放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "seated-dumbbell-press",
  "zh": "坐姿啞鈴肩推",
  "en": "Seated Dumbbell Press",
  "equip": "dumbbell",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "坐著背貼椅背，比較不會用腰",
  "steps": [
   "Grab a couple of dumbbells and sit on a military press bench or a utility bench that has a back support on it as you place the dumbbells upright on top of your thighs.",
   "Clean the dumbbells up one at a time by using your thighs to bring the dumbbells up to shoulder height at each side.",
   "Rotate the wrists so that the palms of your hands are facing forward. This is your starting position.",
   "As you exhale, push the dumbbells up until they touch at the top.",
   "After a second pause, slowly come down back to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "拿兩個啞鈴，坐在有靠背的推肩椅或可調式椅上，把啞鈴直立放在大腿上。",
   "利用大腿的力量，一次一個把啞鈴帶到肩膀兩側高度。",
   "轉動手腕讓掌心朝前。這是起始姿勢。",
   "吐氣，把啞鈴往上推到頂端互相輕碰。",
   "停 1 秒後，吸氣慢慢回到起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "arnold-dumbbell-press",
  "zh": "阿諾肩推",
  "en": "Arnold Dumbbell Press",
  "equip": "dumbbell",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "掌心朝自己開始，推起時轉成朝前",
  "steps": [
   "Sit on an exercise bench with back support and hold two dumbbells in front of you at about upper chest level with your palms facing your body and your elbows bent. Tip: Your arms should be next to your torso. The starting position should look like the contracted portion of a dumbbell curl.",
   "Now to perform the movement, raise the dumbbells as you rotate the palms of your hands until they are facing forward.",
   "Continue lifting the dumbbells until your arms are extended above you in straight arm position. Breathe out as you perform this portion of the movement.",
   "After a second pause at the top, begin to lower the dumbbells to the original position by rotating the palms of your hands towards you. Tip: The left arm will be rotated in a counter clockwise manner while the right one will be rotated clockwise. Breathe in as you perform this portion of the movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "坐在有靠背的椅子上，雙手各拿一個啞鈴放在上胸前方，掌心朝向身體、手肘彎曲。小提醒：手臂靠近身體兩側，起始姿勢就像啞鈴彎舉的頂端位置。",
   "開始動作時，一邊把啞鈴往上推，一邊轉動手掌直到掌心朝前。",
   "持續往上推到手臂在頭頂伸直，這段過程吐氣。",
   "在頂端停 1 秒，再一邊把掌心轉回朝向自己、一邊把啞鈴放回起始位置。小提醒：左手逆時針轉、右手順時針轉。這段過程吸氣。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "side-lateral-raise",
  "zh": "啞鈴側平舉",
  "en": "Side Lateral Raise",
  "equip": "dumbbell",
  "primary": [
   "shoulders"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘微彎往兩側抬到肩膀高度，不要甩",
  "steps": [
   "Pick a couple of dumbbells and stand with a straight torso and the dumbbells by your side at arms length with the palms of the hand facing you. This will be your starting position.",
   "While maintaining the torso in a stationary position (no swinging), lift the dumbbells to your side with a slight bend on the elbow and the hands slightly tilted forward as if pouring water in a glass. Continue to go up until you arms are parallel to the floor. Exhale as you execute this movement and pause for a second at the top.",
   "Lower the dumbbells back down slowly to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "拿兩個啞鈴，身體站直，啞鈴垂在身體兩側，掌心朝向身體。這是起始姿勢。",
   "上半身保持不動（不要晃），手肘微彎，把啞鈴往兩側舉起，手掌稍微往前傾，像在倒水一樣。舉到手臂與地面平行，過程吐氣，在頂端停 1 秒。",
   "吸氣，慢慢把啞鈴放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "front-dumbbell-raise",
  "zh": "啞鈴前平舉",
  "en": "Front Dumbbell Raise",
  "equip": "dumbbell",
  "primary": [
   "shoulders"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手臂往前抬到肩膀高度，練前肩",
  "steps": [
   "Pick a couple of dumbbells and stand with a straight torso and the dumbbells on front of your thighs at arms length with the palms of the hand facing your thighs. This will be your starting position.",
   "While maintaining the torso stationary (no swinging), lift the left dumbbell to the front with a slight bend on the elbow and the palms of the hands always facing down. Continue to go up until you arm is slightly above parallel to the floor. Exhale as you execute this portion of the movement and pause for a second at the top. Inhale after the second pause.",
   "Now lower the dumbbell back down slowly to the starting position as you simultaneously lift the right dumbbell.",
   "Continue alternating in this fashion until all of the recommended amount of repetitions have been performed for each arm."
  ],
  "move": "push",
  "stepsZh": [
   "拿兩個啞鈴，身體站直，啞鈴垂在大腿前方，掌心朝向大腿。這是起始姿勢。",
   "上半身保持不動（不要晃），手肘微彎、掌心朝下，把左手啞鈴往前舉起，舉到略高於與地面平行。舉起時吐氣，在頂端停 1 秒後吸氣。",
   "慢慢把左手啞鈴放回起始位置，同時舉起右手啞鈴。",
   "左右交替，直到每隻手都完成建議次數。"
  ]
 },
 {
  "id": "cable-seated-lateral-raise",
  "zh": "繩索側平舉",
  "en": "Cable Seated Lateral Raise",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "middle back",
   "traps"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "繩索讓整個動作都有阻力",
  "steps": [
   "Stand in the middle of two low pulleys that are opposite to each other and place a flat bench right behind you (in perpendicular fashion to you; the narrow edge of the bench should be the one behind you). Select the weight to be used on each pulley.",
   "Now sit at the edge of the flat bench behind you with your feet placed in front of your knees.",
   "Bend forward while keeping your back flat and rest your torso on the thighs.",
   "Have someone give you the single handles attached to the pulleys. Grasp the left pulley with the right hand and the right pulley with the left after you select your weight. The pulleys should run under your knees and your arms will be extended with palms facing each other and a slight bend at the elbows. This will be the starting position.",
   "While keeping the arms stationary, raise the upper arms to the sides until they are parallel to the floor and at shoulder height. Exhale during the execution of this movement and hold the contraction for a second.",
   "Slowly lower your arms to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions. Tip: Maintain upper arms perpendicular to torso and a fixed elbow position (10 degree to 30 degree angle) throughout exercise."
  ],
  "move": "pull",
  "stepsZh": [
   "站在兩個相對的低位滑輪中間，在身後放一張平板臥推椅（與你垂直，椅子窄的那端靠在你身後）。兩邊滑輪設定好重量。",
   "坐在身後椅子的邊緣，雙腳放在膝蓋前方。",
   "背部保持平直往前彎，讓上半身靠在大腿上。",
   "請人把滑輪上的單手握把遞給你：右手握左邊的滑輪、左手握右邊的滑輪。繩索從膝蓋下方穿過，手臂伸直、掌心相對、手肘微彎。這是起始姿勢。",
   "手臂角度固定，把上臂往兩側抬到與地面平行、與肩同高。過程吐氣，在頂端停 1 秒。",
   "吸氣，慢慢把手臂放回起始位置。",
   "依建議次數重複動作。小提醒：全程上臂與上半身保持垂直，手肘固定在微彎約 10 到 30 度。"
  ]
 },
 {
  "id": "reverse-machine-flyes",
  "zh": "反向蝴蝶機",
  "en": "Reverse Machine Flyes",
  "equip": "machine",
  "primary": [
   "shoulders"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "面向機器，手臂往後打開，練後肩與上背",
  "steps": [
   "Adjust the handles so that they are fully to the rear. Make an appropriate weight selection and adjust the seat height so the handles are at shoulder level. Grasp the handles with your hands facing inwards. This will be your starting position.",
   "In a semicircular motion, pull your hands out to your side and back, contracting your rear delts.",
   "Keep your arms slightly bent throughout the movement, with all of the motion occurring at the shoulder joint.",
   "Pause at the rear of the movement, and slowly return the weight to the starting position."
  ],
  "move": "pull",
  "stepsZh": [
   "把握把調到最後方，選好適當重量，調整座椅高度讓握把與肩同高。雙手對握握把。這是起始姿勢。",
   "以半圓弧的軌跡把雙手往兩側、往後拉，收縮後三角肌。",
   "全程手臂微彎，只靠肩關節活動。",
   "在最後方稍停，再慢慢回到起始位置。"
  ]
 },
 {
  "id": "machine-shoulder-military-press",
  "zh": "坐姿推肩機",
  "en": "Machine Shoulder (Military) Press",
  "equip": "machine",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "握把在肩膀高度開始，推到手臂快伸直",
  "steps": [
   "Sit down on the Shoulder Press Machine and select the weight.",
   "Grab the handles to your sides as you keep the elbows bent and in line with your torso. This will be your starting position.",
   "Now lift the handles as you exhale and you extend the arms fully. At the top of the position make sure that you hold the contraction for a second.",
   "Lower the handles slowly back to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "坐上推肩機並選好重量。",
   "握住身體兩側的握把，手肘彎曲並與上半身成一直線。這是起始姿勢。",
   "吐氣，把握把往上推到手臂完全伸直，在頂端停 1 秒。",
   "吸氣，慢慢把握把放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "upright-barbell-row",
  "zh": "槓鈴直立划船",
  "en": "Upright Barbell Row",
  "equip": "barbell",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "traps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "槓沿身體拉到胸口，手肘比手高",
  "steps": [
   "Grasp a barbell with an overhand grip that is slightly less than shoulder width. The bar should be resting on the top of your thighs with your arms extended and a slight bend in your elbows. Your back should also be straight. This will be your starting position.",
   "Now exhale and use the sides of your shoulders to lift the bar, raising your elbows up and to the side. Keep the bar close to your body as you raise it. Continue to lift the bar until it nearly touches your chin. Tip: Your elbows should drive the motion, and should always be higher than your forearms. Remember to keep your torso stationary and pause for a second at the top of the movement.",
   "Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "以略窄於肩寬的正握握住槓鈴，槓靠在大腿前側，手臂伸直、手肘微彎，背部打直。這是起始姿勢。",
   "吐氣，用肩膀側邊的力量把槓往上拉，手肘往上、往外抬，槓貼近身體上升，拉到快碰到下巴。小提醒：由手肘帶動動作，手肘要一直高於前臂。上半身保持不動，在頂端停 1 秒。",
   "吸氣，慢慢把槓放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "barbell-shrug",
  "zh": "槓鈴聳肩",
  "en": "Barbell Shrug",
  "equip": "barbell",
  "primary": [
   "traps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "肩膀往耳朵方向抬，頂點停一秒",
  "steps": [
   "Stand up straight with your feet at shoulder width as you hold a barbell with both hands in front of you using a pronated grip (palms facing the thighs). Tip: Your hands should be a little wider than shoulder width apart. You can use wrist wraps for this exercise for a better grip. This will be your starting position.",
   "Raise your shoulders up as far as you can go as you breathe out and hold the contraction for a second. Tip: Refrain from trying to lift the barbell by using your biceps.",
   "Slowly return to the starting position as you breathe in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "雙腳與肩同寬站直，雙手以正握（掌心朝向大腿）握住身體前方的槓鈴。小提醒：握距略比肩寬，可以用拉力帶幫助握緊。這是起始姿勢。",
   "吐氣，把肩膀盡量往上聳，在頂端停 1 秒。小提醒：不要用二頭把槓往上拉。",
   "吸氣，慢慢回到起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "dumbbell-shrug",
  "zh": "啞鈴聳肩",
  "en": "Dumbbell Shrug",
  "equip": "dumbbell",
  "primary": [
   "traps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手臂自然垂直，只動肩膀",
  "steps": [
   "Stand erect with a dumbbell on each hand (palms facing your torso), arms extended on the sides.",
   "Lift the dumbbells by elevating the shoulders as high as possible while you exhale. Hold the contraction at the top for a second. Tip: The arms should remain extended at all times. Refrain from using the biceps to help lift the dumbbells. Only the shoulders should be moving up and down.",
   "Lower the dumbbells back to the original position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "身體站直，雙手各拿一個啞鈴垂在身體兩側，掌心朝向身體。",
   "吐氣，把肩膀盡量往上聳、帶起啞鈴，在頂端停 1 秒。小提醒：手臂全程伸直，不要用二頭幫忙，只有肩膀上下移動。",
   "把啞鈴放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "smith-machine-overhead-shoulder-press",
  "zh": "史密斯肩推",
  "en": "Smith Machine Overhead Shoulder Press",
  "equip": "smith",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "坐在椅上推，軌道固定比較穩",
  "steps": [
   "To begin, place a flat bench (or preferably one with back support) underneath a smith machine. Position the barbell at a height so that when seated on the flat bench, the arms must be almost fully extended to reach the barbell.",
   "Once you have the correct height, sit slightly in behind the barbell so that there is an imaginary straight line from the tip of your nose to the barbell. Your feet should be stationary. Grab the barbell with the palms facing forward, unlock it and lift it up so that your arms are fully extended. This is the starting position.",
   "Slowly begin to lower the barbell until it is level with your chin while inhaling.",
   "Then lift the barbell back to the starting position using your shoulders while exhaling.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "在史密斯機下方放一張平板椅（有靠背的更好）。調整槓的高度，讓你坐下時手臂幾乎要完全伸直才搆得到槓。",
   "高度調好後，坐在槓的稍後方，讓鼻尖到槓之間大約成一直線，雙腳踩穩。掌心朝前握住槓，解鎖後往上推到手臂伸直。這是起始姿勢。",
   "吸氣，慢慢把槓放到與下巴同高。",
   "吐氣，用肩膀的力量把槓推回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "barbell-curl",
  "zh": "槓鈴彎舉",
  "en": "Barbell Curl",
  "equip": "barbell",
  "primary": [
   "biceps"
  ],
  "secondary": [
   "forearms"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "手肘貼身體不動，只動前臂",
  "steps": [
   "Stand up with your torso upright while holding a barbell at a shoulder-width grip. The palm of your hands should be facing forward and the elbows should be close to the torso. This will be your starting position.",
   "While holding the upper arms stationary, curl the weights forward while contracting the biceps as you breathe out. Tip: Only the forearms should move.",
   "Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second and squeeze the biceps hard.",
   "Slowly begin to bring the bar back to starting position as your breathe in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "身體站直，以與肩同寬的握距握住槓鈴，掌心朝前，手肘貼近身體。這是起始姿勢。",
   "上臂保持不動，吐氣、收縮二頭把槓往上彎舉。小提醒：只有前臂在動。",
   "持續彎舉到二頭完全收縮、槓來到肩膀高度，停 1 秒並用力夾緊二頭。",
   "吸氣，慢慢把槓放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "dumbbell-bicep-curl",
  "zh": "啞鈴二頭彎舉",
  "en": "Dumbbell Bicep Curl",
  "equip": "dumbbell",
  "primary": [
   "biceps"
  ],
  "secondary": [
   "forearms"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "舉起時掌心轉向上，慢慢放下",
  "steps": [
   "Stand up straight with a dumbbell in each hand at arm's length. Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward. This will be your starting position.",
   "Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps. Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a brief pause as you squeeze your biceps.",
   "Then, inhale and slowly begin to lower the dumbbells back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "身體站直，雙手各拿一個啞鈴垂在身體兩側。手肘貼近身體，轉動手掌讓掌心朝前。這是起始姿勢。",
   "上臂保持不動，吐氣、收縮二頭把啞鈴往上彎舉，直到二頭完全收縮、啞鈴來到肩膀高度。稍停一下並夾緊二頭。",
   "接著吸氣，慢慢把啞鈴放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "hammer-curls",
  "zh": "錘式彎舉",
  "en": "Hammer Curls",
  "equip": "dumbbell",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "掌心相對像拿鐵鎚，練肱橈肌",
  "steps": [
   "Stand up with your torso upright and a dumbbell on each hand being held at arms length. The elbows should be close to the torso.",
   "The palms of the hands should be facing your torso. This will be your starting position.",
   "Now, while holding your upper arm stationary, exhale and curl the weight forward while contracting the biceps. Continue to raise the weight until the biceps are fully contracted and the dumbbell is at shoulder level. Hold the contracted position for a brief moment as you squeeze the biceps. Tip: Focus on keeping the elbow stationary and only moving your forearm.",
   "After the brief pause, inhale and slowly begin the lower the dumbbells back down to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "身體站直，雙手各拿一個啞鈴垂在身體兩側，手肘貼近身體。",
   "掌心朝向身體。這是起始姿勢。",
   "上臂保持不動，吐氣、收縮二頭把啞鈴往上彎舉，直到二頭完全收縮、啞鈴來到肩膀高度，稍停並夾緊二頭。小提醒：手肘固定不動，只動前臂。",
   "稍停後吸氣，慢慢把啞鈴放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "preacher-curl",
  "zh": "牧師椅彎舉",
  "en": "Preacher Curl",
  "equip": "barbell",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂貼著墊子，避免借力",
  "steps": [
   "To perform this movement you will need a preacher bench and an E-Z bar. Grab the E-Z curl bar at the close inner handle (either have someone hand you the bar which is preferable or grab the bar from the front bar rest provided by most preacher benches). The palm of your hands should be facing forward and they should be slightly tilted inwards due to the shape of the bar.",
   "With the upper arms positioned against the preacher bench pad and the chest against it, hold the E-Z Curl Bar at shoulder length. This will be your starting position.",
   "As you breathe in, slowly lower the bar until your upper arm is extended and the biceps is fully stretched.",
   "As you exhale, use the biceps to curl the weight up until your biceps is fully contracted and the bar is at shoulder height. Squeeze the biceps hard and hold this position for a second.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "這個動作需要牧師椅和曲槓。握住曲槓內側較窄的握位（最好請人把槓遞給你，或從牧師椅前方的槓架拿起）。掌心朝前，因槓的形狀手掌會稍微往內傾。",
   "上臂和胸口貼住牧師椅墊，把曲槓舉在肩膀高度。這是起始姿勢。",
   "吸氣，慢慢把槓放下，直到上臂伸直、二頭完全伸展。",
   "吐氣，用二頭把槓往上彎舉，直到二頭完全收縮、槓來到肩膀高度。用力夾緊二頭，停 1 秒。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "concentration-curls",
  "zh": "集中彎舉",
  "en": "Concentration Curls",
  "equip": "dumbbell",
  "primary": [
   "biceps"
  ],
  "secondary": [
   "forearms"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "手肘靠在大腿內側，專心擠壓二頭",
  "steps": [
   "Sit down on a flat bench with one dumbbell in front of you between your legs. Your legs should be spread with your knees bent and feet on the floor.",
   "Use your right arm to pick the dumbbell up. Place the back of your right upper arm on the top of your inner right thigh. Rotate the palm of your hand until it is facing forward away from your thigh. Tip: Your arm should be extended and the dumbbell should be above the floor. This will be your starting position.",
   "While holding the upper arm stationary, curl the weights forward while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the dumbbells are at shoulder level. Tip: At the top of the movement make sure that the little finger of your arm is higher than your thumb. This guarantees a good contraction. Hold the contracted position for a second as you squeeze the biceps.",
   "Slowly begin to bring the dumbbells back to starting position as your breathe in. Caution: Avoid swinging motions at any time.",
   "Repeat for the recommended amount of repetitions. Then repeat the movement with the left arm."
  ],
  "move": "pull",
  "stepsZh": [
   "坐在平板椅上，把一個啞鈴放在兩腿之間的前方。雙腿張開、膝蓋彎曲、雙腳踩地。",
   "用右手拿起啞鈴，把右上臂後側靠在右大腿內側上方。轉動手掌讓掌心朝前、背對大腿。小提醒：手臂伸直，啞鈴懸空不碰地。這是起始姿勢。",
   "上臂保持不動，吐氣、收縮二頭把啞鈴往上彎舉，只有前臂在動。持續到二頭完全收縮、啞鈴來到肩膀高度。小提醒：到頂端時，讓小指比大拇指高，收縮效果更好。停 1 秒並夾緊二頭。",
   "吸氣，慢慢把啞鈴放回起始位置。注意：全程避免甩動。",
   "依建議次數重複動作，再換左手做。"
  ]
 },
 {
  "id": "cable-hammer-curls-rope-attachment",
  "zh": "繩索錘式彎舉",
  "en": "Cable Hammer Curls - Rope Attachment",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "用繩索握把做錘式彎舉",
  "steps": [
   "Attach a rope attachment to a low pulley and stand facing the machine about 12 inches away from it.",
   "Grasp the rope with a neutral (palms-in) grip and stand straight up keeping the natural arch of the back and your torso stationary.",
   "Put your elbows in by your side and keep them there stationary during the entire movement. Tip: Only the forearms should move; not your upper arms. This will be your starting position.",
   "Using your biceps, pull your arms up as you exhale until your biceps touch your forearms. Tip: Remember to keep the elbows in and your upper arms stationary.",
   "After a 1 second contraction where you squeeze your biceps, slowly start to bring the weight back to the original position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "在低位滑輪接上繩索，面向機器站在約 30 公分外。",
   "以對握（掌心朝內）握住繩索，身體站直，維持背部自然弧度，上半身保持不動。",
   "手肘夾在身體兩側，整個動作過程都固定不動。小提醒：只動前臂，上臂不動。這是起始姿勢。",
   "吐氣，用二頭把手往上拉，直到二頭碰到前臂。小提醒：記得手肘夾緊、上臂不動。",
   "夾緊二頭停 1 秒後，慢慢把重量放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "ez-bar-curl",
  "zh": "曲槓彎舉",
  "en": "EZ-Bar Curl",
  "equip": "barbell",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "曲槓讓手腕比較舒服",
  "steps": [
   "Stand up straight while holding an EZ curl bar at the wide outer handle. The palms of your hands should be facing forward and slightly tilted inward due to the shape of the bar. Keep your elbows close to your torso. This will be your starting position.",
   "Now, while keeping your upper arms stationary, exhale and curl the weights forward while contracting the biceps. Focus on only moving your forearms.",
   "Continue to raise the weight until your biceps are fully contracted and the bar is at shoulder level. Hold the top contracted position for a moment and squeeze the biceps.",
   "Then inhale and slowly lower the bar back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "身體站直，握住曲槓外側較寬的握位。掌心朝前，因槓的形狀手掌會稍微往內傾。手肘貼近身體。這是起始姿勢。",
   "上臂保持不動，吐氣、收縮二頭把槓往上彎舉，專心只動前臂。",
   "持續彎舉到二頭完全收縮、槓來到肩膀高度，在頂端稍停並夾緊二頭。",
   "接著吸氣，慢慢把槓放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "incline-dumbbell-curl",
  "zh": "上斜啞鈴彎舉",
  "en": "Incline Dumbbell Curl",
  "equip": "dumbbell",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "躺在斜椅上，手臂往後垂，拉長二頭",
  "steps": [
   "Sit back on an incline bench with a dumbbell in each hand held at arms length. Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward. This will be your starting position.",
   "While holding the upper arm stationary, curl the weights forward while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the dumbbells are at shoulder level. Hold the contracted position for a second.",
   "Slowly begin to bring the dumbbells back to starting position as your breathe in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "背靠上斜臥推椅坐好，雙手各拿一個啞鈴自然垂下。手肘貼近身體，轉動手掌讓掌心朝前。這是起始姿勢。",
   "上臂保持不動，吐氣、收縮二頭把啞鈴往上彎舉，只有前臂在動。持續到二頭完全收縮、啞鈴來到肩膀高度，停 1 秒。",
   "吸氣，慢慢把啞鈴放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "standing-biceps-cable-curl",
  "zh": "繩索二頭彎舉",
  "en": "Standing Biceps Cable Curl",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "站在滑輪前，手肘固定往上彎",
  "steps": [
   "Stand up with your torso upright while holding a cable curl bar that is attached to a low pulley. Grab the cable bar at shoulder width and keep the elbows close to the torso. The palm of your hands should be facing up (supinated grip). This will be your starting position.",
   "While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second as you squeeze the muscle.",
   "Slowly begin to bring the curl bar back to starting position as your breathe in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "pull",
  "stepsZh": [
   "身體站直，握住接在低位滑輪上的彎舉桿。握距與肩同寬，手肘貼近身體，掌心朝上（反握）。這是起始姿勢。",
   "上臂保持不動，吐氣、收縮二頭往上彎舉，只有前臂在動。持續到二頭完全收縮、握桿來到肩膀高度，停 1 秒並夾緊肌肉。",
   "吸氣，慢慢把握桿放回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "triceps-pushdown",
  "zh": "三頭下壓",
  "en": "Triceps Pushdown",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘貼身體，往下壓到手臂打直",
  "steps": [
   "Attach a straight or angled bar to a high pulley and grab with an overhand grip (palms facing down) at shoulder width.",
   "Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the floor. The forearms should be pointing up towards the pulley as they hold the bar. This is your starting position.",
   "Using the triceps, bring the bar down until it touches the front of your thighs and the arms are fully extended perpendicular to the floor. The upper arms should always remain stationary next to your torso and only the forearms should move. Exhale as you perform this movement.",
   "After a second hold at the contracted position, bring the bar slowly up to the starting point. Breathe in as you perform this step.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "在高位滑輪接上直桿或彎桿，以與肩同寬的正握（掌心朝下）握住。",
   "身體站直、上半身微微前傾，上臂貼近身體並與地面垂直，前臂朝上指向滑輪、握住握桿。這是起始姿勢。",
   "用三頭把握桿往下壓，直到碰到大腿前側、手臂完全伸直並與地面垂直。上臂全程固定在身體旁，只有前臂在動。過程吐氣。",
   "在底部停 1 秒後，慢慢讓握桿回到起始位置，過程吸氣。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "triceps-pushdown-rope-attachment",
  "zh": "繩索三頭下壓",
  "en": "Triceps Pushdown - Rope Attachment",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "壓到底時把繩子往兩側分開",
  "steps": [
   "Attach a rope attachment to a high pulley and grab with a neutral grip (palms facing each other).",
   "Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the floor. The forearms should be pointing up towards the pulley as they hold the rope with the palms facing each other. This is your starting position.",
   "Using the triceps, bring the rope down as you bring each side of the rope to the side of your thighs. At the end of the movement the arms are fully extended and perpendicular to the floor. The upper arms should always remain stationary next to your torso and only the forearms should move. Exhale as you perform this movement.",
   "After holding for a second, at the contracted position, bring the rope slowly up to the starting point. Breathe in as you perform this step.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "在高位滑輪接上繩索，以對握（掌心相對）握住。",
   "身體站直、上半身微微前傾，上臂貼近身體並與地面垂直，前臂朝上指向滑輪，掌心相對握住繩索。這是起始姿勢。",
   "用三頭把繩索往下壓，同時把繩索兩端分別帶到大腿兩側。動作結束時手臂完全伸直、與地面垂直。上臂全程固定在身體旁，只有前臂在動。過程吐氣。",
   "在底部停 1 秒後，慢慢讓繩索回到起始位置，過程吸氣。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "ez-bar-skullcrusher",
  "zh": "曲槓仰臥臂屈伸",
  "en": "EZ-Bar Skullcrusher",
  "equip": "barbell",
  "primary": [
   "triceps"
  ],
  "secondary": [
   "forearms"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "躺著把槓往額頭方向放下，上臂不動",
  "steps": [
   "Using a close grip, lift the EZ bar and hold it with your elbows in as you lie on the bench. Your arms should be perpendicular to the floor. This will be your starting position.",
   "Keeping the upper arms stationary, lower the bar by allowing the elbows to flex. Inhale as you perform this portion of the movement. Pause once the bar is directly above the forehead.",
   "Lift the bar back to the starting position by extending the elbow and exhaling.",
   "Repeat."
  ],
  "move": "push",
  "stepsZh": [
   "以窄握拿起曲槓，躺在臥推椅上，手肘往內收，手臂與地面垂直。這是起始姿勢。",
   "上臂保持不動，彎曲手肘把槓往下放，過程吸氣。槓來到額頭正上方時稍停。",
   "吐氣，伸直手肘把槓推回起始位置。",
   "重複動作。"
  ]
 },
 {
  "id": "lying-triceps-press",
  "zh": "仰臥三頭伸展",
  "en": "Lying Triceps Press",
  "equip": "barbell",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": false,
  "cue": "上臂固定，只用手肘彎曲伸直",
  "steps": [
   "Lie on a flat bench with either an e-z bar (my preference) or a straight bar placed on the floor behind your head and your feet on the floor.",
   "Grab the bar behind you, using a medium overhand (pronated) grip, and raise the bar in front of you at arms length. Tip: The arms should be perpendicular to the torso and the floor. The elbows should be tucked in. This is the starting position.",
   "As you breathe in, slowly lower the weight until the bar lightly touches your forehead while keeping the upper arms and elbows stationary.",
   "At that point, use the triceps to bring the weight back up to the starting position as you breathe out.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "躺在平板臥推椅上，雙腳踩地，頭後方的地上放一支曲槓或直槓。",
   "往後握住槓，用中等握距正握，把槓舉到胸前上方、手臂伸直。小提醒：手臂與身體和地面垂直，手肘往內收。這是起始姿勢。",
   "吸氣，上臂和手肘保持不動，慢慢把槓放到輕碰額頭。",
   "吐氣，用三頭把槓推回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "standing-dumbbell-triceps-extension",
  "zh": "啞鈴頸後臂屈伸",
  "en": "Standing Dumbbell Triceps Extension",
  "equip": "dumbbell",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "雙手握一顆啞鈴舉過頭，往頭後放下",
  "steps": [
   "To begin, stand up with a dumbbell held by both hands. Your feet should be about shoulder width apart from each other. Slowly use both hands to grab the dumbbell and lift it over your head until both arms are fully extended.",
   "The resistance should be resting in the palms of your hands with your thumbs around it. The palm of the hands should be facing up towards the ceiling. This will be your starting position.",
   "Keeping your upper arms close to your head with elbows in and perpendicular to the floor, lower the resistance in a semicircular motion behind your head until your forearms touch your biceps. Tip: The upper arms should remain stationary and only the forearms should move. Breathe in as you perform this step.",
   "Go back to the starting position by using the triceps to raise the dumbbell. Breathe out as you perform this step.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "站直，雙腳約與肩同寬。雙手握住一個啞鈴，慢慢舉到頭頂，直到雙臂完全伸直。",
   "讓啞鈴靠在掌心上，大拇指環繞握把，掌心朝上對著天花板。這是起始姿勢。",
   "上臂貼近頭部、手肘內收並與地面垂直，以半圓弧的軌跡把啞鈴往頭後放，直到前臂碰到二頭。小提醒：上臂保持不動，只動前臂。過程吸氣。",
   "吐氣，用三頭把啞鈴舉回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "bench-dips",
  "zh": "椅子撐體",
  "en": "Bench Dips",
  "equip": "body",
  "primary": [
   "triceps"
  ],
  "secondary": [
   "chest",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "手撐椅子邊緣，往下到手肘約 90 度",
  "steps": [
   "For this exercise you will need to place a bench behind your back. With the bench perpendicular to your body, and while looking away from it, hold on to the bench on its edge with the hands fully extended, separated at shoulder width. The legs will be extended forward, bent at the waist and perpendicular to your torso. This will be your starting position.",
   "Slowly lower your body as you inhale by bending at the elbows until you lower yourself far enough to where there is an angle slightly smaller than 90 degrees between the upper arm and the forearm. Tip: Keep the elbows as close as possible throughout the movement. Forearms should always be pointing down.",
   "Using your triceps to bring your torso up again, lift yourself back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "把一張臥推椅放在身後，與身體垂直，背對椅子。雙手與肩同寬撐在椅子邊緣、手臂伸直。雙腿往前伸直，髖部彎曲讓腿與上半身垂直。這是起始姿勢。",
   "吸氣，彎曲手肘慢慢讓身體往下，直到上臂與前臂的夾角略小於 90 度。小提醒：手肘盡量往內收，前臂始終朝下。",
   "用三頭把身體撐回起始位置。",
   "依建議次數重複動作。"
  ]
 },
 {
  "id": "dips-triceps-version",
  "zh": "雙槓撐體（三頭）",
  "en": "Dips - Triceps Version",
  "equip": "body",
  "primary": [
   "triceps"
  ],
  "secondary": [
   "chest",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "身體直立、手肘夾緊，練三頭",
  "steps": [
   "To get into the starting position, hold your body at arm's length with your arms nearly locked above the bars.",
   "Now, inhale and slowly lower yourself downward. Your torso should remain upright and your elbows should stay close to your body. This helps to better focus on tricep involvement. Lower yourself until there is a 90 degree angle formed between the upper arm and forearm.",
   "Then, exhale and push your torso back up using your triceps to bring your body back to the starting position.",
   "Repeat the movement for the prescribed amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "起始姿勢：雙手撐在雙槓上，手臂接近伸直，把身體撐起來。",
   "吸氣，慢慢讓身體往下。上半身保持直立、手肘貼近身體，這樣更能集中練到三頭。往下到上臂與前臂呈 90 度。",
   "吐氣，用三頭把身體撐回起始位置。",
   "依指定次數重複動作。"
  ]
 },
 {
  "id": "close-grip-barbell-bench-press",
  "zh": "窄握臥推",
  "en": "Close-Grip Barbell Bench Press",
  "equip": "barbell",
  "primary": [
   "triceps"
  ],
  "secondary": [
   "chest",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "手距與肩同寬，手肘貼近身體",
  "steps": [
   "Lie back on a flat bench. Using a close grip (around shoulder width), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
   "As you breathe in, come down slowly until you feel the bar on your middle chest. Tip: Make sure that - as opposed to a regular bench press - you keep the elbows close to the torso at all times in order to maximize triceps involvement.",
   "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your triceps muscles. Lock your arms in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up.",
   "Repeat the movement for the prescribed amount of repetitions.",
   "When you are done, place the bar back in the rack."
  ],
  "move": "push",
  "stepsZh": [
   "躺在平板臥推椅上，以窄握（約與肩同寬）把槓從架上拿起，手臂伸直撐在身體正上方。這是起始姿勢。",
   "吸氣，慢慢把槓放到中胸。小提醒：和一般臥推不同，全程手肘要貼近身體，才能讓三頭出最多力。",
   "停 1 秒後，吐氣用三頭把槓推回起始位置。手臂伸直撐住 1 秒，再慢慢往下。小提醒：下放的時間至少是推起的 2 倍。",
   "依指定次數重複動作。",
   "做完後把槓放回架上。"
  ]
 },
 {
  "id": "tricep-dumbbell-kickback",
  "zh": "啞鈴後踢",
  "en": "Tricep Dumbbell Kickback",
  "equip": "dumbbell",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上身前傾，上臂貼身體，往後伸直",
  "steps": [
   "Start with a dumbbell in each hand and your palms facing your torso. Keep your back straight with a slight bend in the knees and bend forward at the waist. Your torso should be almost parallel to the floor. Make sure to keep your head up. Your upper arms should be close to your torso and parallel to the floor. Your forearms should be pointed towards the floor as you hold the weights. There should be a 90-degree angle formed between your forearm and upper arm. This is your starting position.",
   "Now, while keeping your upper arms stationary, exhale and use your triceps to lift the weights until the arm is fully extended. Focus on moving the forearm.",
   "After a brief pause at the top contraction, inhale and slowly lower the dumbbells back down to the starting position.",
   "Repeat the movement for the prescribed amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "雙手各拿一個啞鈴，掌心朝向身體。背部打直、膝蓋微彎，從髖部往前彎，上半身幾乎與地面平行，頭抬起。上臂貼近身體並與地面平行，前臂朝下拿著啞鈴，上臂與前臂呈 90 度。這是起始姿勢。",
   "上臂保持不動，吐氣用三頭把啞鈴往後舉，直到手臂完全伸直。專心只動前臂。",
   "在頂端稍停，吸氣慢慢把啞鈴放回起始位置。",
   "依指定次數重複動作。"
  ]
 },
 {
  "id": "cable-rope-overhead-triceps-extension",
  "zh": "繩索過頭三頭伸展",
  "en": "Cable Rope Overhead Triceps Extension",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "背對滑輪，把繩子從頭後往前上方伸直",
  "steps": [
   "Attach a rope to the bottom pulley of the pulley machine.",
   "Grasping the rope with both hands, extend your arms with your hands directly above your head using a neutral grip (palms facing each other). Your elbows should be in close to your head and the arms should be perpendicular to the floor with the knuckles aimed at the ceiling. This will be your starting position.",
   "Slowly lower the rope behind your head as you hold the upper arms stationary. Inhale as you perform this movement and pause when your triceps are fully stretched.",
   "Return to the starting position by flexing your triceps as you breathe out.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "push",
  "stepsZh": [
   "將繩索握把裝在滑輪機的低位滑輪上。",
   "雙手握住繩索，掌心相對，手臂往上伸直到頭頂正上方。手肘靠近頭部，上臂與地面垂直，指節朝向天花板，這是起始姿勢。",
   "上臂保持不動，慢慢把繩索往頭後放下，同時吸氣，感覺三頭完全伸展時停一下。",
   "吐氣，收縮三頭把繩索推回起始位置。",
   "依建議次數重複。"
  ]
 },
 {
  "id": "crunches",
  "zh": "捲腹",
  "en": "Crunches",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "下背貼地，只把肩膀捲離地面",
  "steps": [
   "Lie flat on your back with your feet flat on the ground, or resting on a bench with your knees bent at a 90 degree angle. If you are resting your feet on a bench, place them three to four inches apart and point your toes inward so they touch.",
   "Now place your hands lightly on either side of your head keeping your elbows in. Tip: Don't lock your fingers behind your head.",
   "While pushing the small of your back down in the floor to better isolate your abdominal muscles, begin to roll your shoulders off the floor.",
   "Continue to push down as hard as you can with your lower back as you contract your abdominals and exhale. Your shoulders should come up off the floor only about four inches, and your lower back should remain on the floor. At the top of the movement, contract your abdominals hard and keep the contraction for a second. Tip: Focus on slow, controlled movement - don't cheat yourself by using momentum.",
   "After the one second contraction, begin to come down slowly again to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "core",
  "stepsZh": [
   "平躺在地上，雙腳踩地，或把腳放在臥推椅上、膝蓋彎曲 90 度。若腳放在椅上，兩腳相距約 8～10 公分，腳尖朝內互碰。",
   "雙手輕放在頭兩側，手肘向內收。小提醒：手指不要在頭後扣緊。",
   "下背用力壓向地面，讓腹肌更好發力，開始把肩膀捲離地面。",
   "下背持續用力壓地，收縮腹肌並吐氣。肩膀只需離地約 10 公分，下背要留在地上。到最高點時用力收緊腹肌，停 1 秒。小提醒：動作要慢、要控制，不要靠甩的借力。",
   "停 1 秒後，吸氣，慢慢回到起始姿勢。",
   "依建議次數重複。"
  ]
 },
 {
  "id": "plank",
  "zh": "棒式",
  "en": "Plank",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘在肩膀正下方，身體一直線不塌腰",
  "steps": [
   "Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.",
   "Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."
  ],
  "move": "core",
  "stepsZh": [
   "趴在地上，用腳尖和前臂撐起身體。手肘彎曲，位在肩膀正下方。",
   "全程保持身體成一直線，盡量維持越久越好。想增加難度，可以抬起一隻手或一隻腳。"
  ]
 },
 {
  "id": "hanging-leg-raise",
  "zh": "懸垂抬腿",
  "en": "Hanging Leg Raise",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "expert",
  "compound": false,
  "cue": "吊在單槓上，用腹部把腿抬起，不要晃",
  "steps": [
   "Hang from a chin-up bar with both arms extended at arms length in top of you using either a wide grip or a medium grip. The legs should be straight down with the pelvis rolled slightly backwards. This will be your starting position.",
   "Raise your legs until the torso makes a 90-degree angle with the legs. Exhale as you perform this movement and hold the contraction for a second or so.",
   "Go back slowly to the starting position as you breathe in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "core",
  "stepsZh": [
   "雙手以寬握或中等握距吊在單槓上，手臂伸直。雙腿自然垂直向下，骨盆微微後傾，這是起始姿勢。",
   "吐氣，抬起雙腿直到與上半身成 90 度，在頂點停約 1 秒。",
   "吸氣，慢慢放回起始位置。",
   "依建議次數重複。"
  ]
 },
 {
  "id": "cable-crunch",
  "zh": "跪姿繩索捲腹",
  "en": "Cable Crunch",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "跪著拉繩，用腹肌把身體往下捲",
  "steps": [
   "Kneel below a high pulley that contains a rope attachment.",
   "Grasp cable rope attachment and lower the rope until your hands are placed next to your face.",
   "Flex your hips slightly and allow the weight to hyperextend the lower back. This will be your starting position.",
   "With the hips stationary, flex the waist as you contract the abs so that the elbows travel towards the middle of the thighs. Exhale as you perform this portion of the movement and hold the contraction for a second.",
   "Slowly return to the starting position as you inhale. Tip: Make sure that you keep constant tension on the abs throughout the movement. Also, do not choose a weight so heavy that the lower back handles the brunt of the work.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "core",
  "stepsZh": [
   "在裝有繩索握把的高位滑輪下方跪下。",
   "抓住繩索往下拉，讓雙手停在臉的兩側。",
   "髖部微微彎曲，讓重量把下背稍微往後拉伸，這是起始姿勢。",
   "髖部固定不動，收縮腹肌把腰往下捲，讓手肘往大腿中段移動。過程中吐氣，在底部停 1 秒。",
   "吸氣，慢慢回到起始姿勢。小提醒：整個動作都要讓腹肌保持張力；重量不要選太重，以免變成下背在出力。",
   "依建議次數重複。"
  ]
 },
 {
  "id": "russian-twist",
  "zh": "俄羅斯轉體",
  "en": "Russian Twist",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [
   "lower back"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "坐姿身體後仰，左右轉動軀幹",
  "steps": [
   "Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the knees.",
   "Elevate your upper body so that it creates an imaginary V-shape with your thighs. Your arms should be fully extended in front of you perpendicular to your torso and with the hands clasped. This is the starting position.",
   "Twist your torso to the right side until your arms are parallel with the floor while breathing out.",
   "Hold the contraction for a second and move back to the starting position while breathing out. Now move to the opposite side performing the same techniques you applied to the right side.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "core",
  "stepsZh": [
   "躺在地上，把腳勾在固定的物體下，或請夥伴幫你壓住腳。膝蓋彎曲。",
   "抬起上半身，和大腿形成 V 字形。雙手在胸前伸直、與軀幹垂直，雙手交握，這是起始姿勢。",
   "吐氣，將上半身轉向右側，直到手臂與地面平行。",
   "停 1 秒後回到起始姿勢，再用同樣方式轉向左側。",
   "依建議次數重複。"
  ]
 },
 {
  "id": "ab-roller",
  "zh": "健腹輪",
  "en": "Ab Roller",
  "equip": "other",
  "primary": [
   "abdominals"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "核心收緊慢慢推出，不要塌腰",
  "steps": [
   "Hold the Ab Roller with both hands and kneel on the floor.",
   "Now place the ab roller on the floor in front of you so that you are on all your hands and knees (as in a kneeling push up position). This will be your starting position.",
   "Slowly roll the ab roller straight forward, stretching your body into a straight position. Tip: Go down as far as you can without touching the floor with your body. Breathe in during this portion of the movement.",
   "After a pause at the stretched position, start pulling yourself back to the starting position as you breathe out. Tip: Go slowly and keep your abs tight at all times."
  ],
  "move": "core",
  "stepsZh": [
   "雙手握住健腹輪，跪在地上。",
   "把健腹輪放在身體前方地面，呈雙手雙膝撐地的姿勢（類似跪姿伏地挺身），這是起始姿勢。",
   "吸氣，慢慢將健腹輪往前推，讓身體伸展成一直線。小提醒：在身體不碰地的前提下盡量往前推。",
   "在伸展位置停一下，吐氣，把自己拉回起始姿勢。小提醒：動作放慢，全程收緊腹肌。"
  ]
 },
 {
  "id": "air-bike",
  "zh": "空中腳踏車",
  "en": "Air Bike",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": true,
  "cue": "對側手肘碰膝蓋，交替進行",
  "steps": [
   "Lie flat on the floor with your lower back pressed to the ground. For this exercise, you will need to put your hands beside your head. Be careful however to not strain with the neck as you perform it. Now lift your shoulders into the crunch position.",
   "Bring knees up to where they are perpendicular to the floor, with your lower legs parallel to the floor. This will be your starting position.",
   "Now simultaneously, slowly go through a cycle pedal motion kicking forward with the right leg and bringing in the knee of the left leg. Bring your right elbow close to your left knee by crunching to the side, as you breathe out.",
   "Go back to the initial position as you breathe in.",
   "Crunch to the opposite side as you cycle your legs and bring closer your left elbow to your right knee and exhale.",
   "Continue alternating in this manner until all of the recommended repetitions for each side have been completed."
  ],
  "move": "core",
  "stepsZh": [
   "平躺在地上，下背貼地。雙手放在頭兩側，注意不要用脖子出力。把肩膀抬起成捲腹姿勢。",
   "抬起雙膝到與地面垂直，小腿與地面平行，這是起始姿勢。",
   "同時慢慢做出踩腳踏車的動作：右腳往前伸，左膝往內收。吐氣，身體側捲，讓右手肘靠近左膝。",
   "吸氣，回到起始姿勢。",
   "換邊：雙腿交替踩動，身體側捲讓左手肘靠近右膝，同時吐氣。",
   "左右交替，直到兩側都完成建議次數。"
  ]
 },
 {
  "id": "sit-up",
  "zh": "仰臥起坐",
  "en": "Sit-Up",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "腳固定，用腹部把上身抬起",
  "steps": [
   "Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the knees.",
   "Place your hands behind your head and lock them together by clasping your fingers. This is the starting position.",
   "Elevate your upper body so that it creates an imaginary V-shape with your thighs. Breathe out when performing this part of the exercise.",
   "Once you feel the contraction for a second, lower your upper body back down to the starting position while inhaling.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "core",
  "stepsZh": [
   "躺在地上，把腳勾在固定的物體下，或請夥伴幫你壓住腳。膝蓋彎曲。",
   "雙手放在頭後，手指交扣，這是起始姿勢。",
   "吐氣，抬起上半身，和大腿形成 V 字形。",
   "感受腹肌收縮 1 秒後，吸氣，把上半身放回起始位置。",
   "依建議次數重複。"
  ]
 },
 {
  "id": "mountain-climbers",
  "zh": "登山者",
  "en": "Mountain Climbers",
  "equip": "body",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "chest",
   "hamstrings",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "伏地挺身姿勢，雙腳交替快速往胸前收",
  "steps": [
   "Begin in a pushup position, with your weight supported by your hands and toes. Flexing the knee and hip, bring one leg until the knee is approximately under the hip. This will be your starting position.",
   "Explosively reverse the positions of your legs, extending the bent leg until the leg is straight and supported by the toe, and bringing the other foot up with the hip and knee flexed. Repeat in an alternating fashion for 20-30 seconds."
  ],
  "move": "cardio",
  "stepsZh": [
   "從伏地挺身姿勢開始，用雙手和腳尖撐住身體。彎曲髖部和膝蓋，把一隻腳往前收，讓膝蓋大約在髖部下方，這是起始姿勢。",
   "快速交換雙腳：彎曲的腳往後伸直、用腳尖撐地，另一腳同時往前收。左右交替，持續 20～30 秒。"
  ]
 },
 {
  "id": "side-bridge",
  "zh": "側棒式",
  "en": "Side Bridge",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "側躺用手肘撐起，身體一直線",
  "steps": [],
  "move": "core",
  "stepsZh": []
 },
 {
  "id": "decline-crunch",
  "zh": "下斜捲腹",
  "en": "Decline Crunch",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": false,
  "cue": "在下斜椅上捲腹，強度比較高",
  "steps": [
   "Secure your legs at the end of the decline bench and lie down.",
   "Now place your hands lightly on either side of your head keeping your elbows in. Tip: Don't lock your fingers behind your head.",
   "While pushing the small of your back down in the bench to better isolate your abdominal muscles, begin to roll your shoulders off it.",
   "Continue to push down as hard as you can with your lower back as you contract your abdominals and exhale. Your shoulders should come up off the bench only about four inches, and your lower back should remain on the bench. At the top of the movement, contract your abdominals hard and keep the contraction for a second. Tip: Focus on slow, controlled movement - don't cheat yourself by using momentum.",
   "After the one second contraction, begin to come down slowly again to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "move": "core",
  "stepsZh": [
   "把雙腳固定在下斜板的末端，然後躺下。",
   "雙手輕放在頭兩側，手肘向內收。小提醒：手指不要在頭後扣緊。",
   "下背用力壓向椅面，讓腹肌更好發力，開始把肩膀捲離椅面。",
   "下背持續用力壓椅面，收縮腹肌並吐氣。肩膀只需離開椅面約 10 公分，下背要貼在椅面上。到最高點時用力收緊腹肌，停 1 秒。小提醒：動作要慢、要控制，不要靠甩的借力。",
   "停 1 秒後，吸氣，慢慢回到起始姿勢。",
   "依建議次數重複。"
  ]
 },
 {
  "id": "flat-bench-lying-leg-raise",
  "zh": "平躺抬腿",
  "en": "Flat Bench Lying Leg Raise",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "躺在椅上，腿伸直抬起再慢慢放下",
  "steps": [
   "Lie with your back flat on a bench and your legs extended in front of you off the end.",
   "Place your hands either under your glutes with your palms down or by the sides holding on to the bench. This will be your starting position.",
   "As you keep your legs extended, straight as possible with your knees slightly bent but locked raise your legs until they make a 90-degree angle with the floor. Exhale as you perform this portion of the movement and hold the contraction at the top for a second.",
   "Now, as you inhale, slowly lower your legs back down to the starting position."
  ],
  "move": "core",
  "stepsZh": [
   "背部平躺在臥推椅上，雙腿往前伸出椅子末端。",
   "雙手掌心朝下放在臀部下方，或抓住身體兩側的椅緣，這是起始姿勢。",
   "雙腿盡量伸直（膝蓋可微彎但固定），吐氣，把腿抬到與地面成 90 度，在頂點停 1 秒。",
   "吸氣，慢慢把腿放回起始位置。"
  ]
 },
 {
  "id": "dead-bug",
  "zh": "死蟲式",
  "en": "Dead Bug",
  "equip": "body",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": true,
  "cue": "躺著手腳朝上，對側手腳交替伸出，下背貼地",
  "steps": [
   "Begin lying on your back with your hands extended above you toward the ceiling.",
   "Bring your feet, knees, and hips up to 90 degrees.",
   "Exhale hard to bring your ribcage down and flatten your back onto the floor, rotating your pelvis up and squeezing your glutes. Hold this position throughout the movement. This will be your starting position.",
   "Initiate the exercise by extending one leg, straightening the knee and hip to bring the leg just above the ground.",
   "Maintain the position of your lumbar and pelvis as you perform the movement, as your back is going to want to arch.",
   "Stay tight and return the working leg to the starting position.",
   "Repeat on the opposite side, alternating until the set is complete."
  ],
  "move": "core",
  "stepsZh": [
   "仰躺，雙手朝天花板伸直。",
   "抬起雙腳，讓髖部和膝蓋都彎成 90 度。",
   "用力吐氣，讓肋骨往下收、背部平貼地面，骨盆微微上捲並夾緊臀部。整個動作都保持這個姿勢，這是起始姿勢。",
   "伸直一條腿，讓膝蓋和髖部打開，把腿放到接近地面的高度。",
   "過程中背會想拱起來，要穩住下背和骨盆的位置。",
   "保持核心收緊，把伸出的腿收回起始位置。",
   "換另一側，左右交替直到完成這一組。"
  ]
 },
 {
  "id": "one-arm-kettlebell-swings",
  "zh": "單手壺鈴擺盪",
  "en": "One-Arm Kettlebell Swings",
  "equip": "kettlebell",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "calves",
   "glutes",
   "lower back",
   "shoulders"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "用髖部往前頂的力量把壺鈴擺起，不是用手舉",
  "steps": [],
  "move": "pull",
  "stepsZh": []
 },
 {
  "id": "star-jump",
  "zh": "星形跳",
  "en": "Star Jump",
  "equip": "body",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "跳起時手腳張開成星形",
  "steps": [
   "Begin in a relaxed stance with your feet shoulder width apart and hold your arms close to the body.",
   "To initiate the move, squat down halfway and explode back up as high as possible. Fully extend your entire body, spreading your legs and arms away from the body.",
   "As you land, bring your limbs back in and absorb your impact through the legs."
  ],
  "move": "cardio",
  "stepsZh": [
   "放鬆站立，雙腳與肩同寬，雙手貼近身體。",
   "先蹲到一半，再用力往上跳得越高越好。在空中把全身展開，雙手雙腳向外張開。",
   "落地時把手腳收回，用雙腿緩衝落地的衝擊。"
  ]
 },
 {
  "id": "farmers-walk",
  "zh": "農夫走路",
  "en": "Farmer's Walk",
  "equip": "dumbbell",
  "primary": [
   "forearms"
  ],
  "secondary": [
   "abdominals",
   "glutes",
   "hamstrings",
   "lower back",
   "quadriceps",
   "traps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "雙手提重物，挺胸收核心穩穩走",
  "steps": [
   "There are various implements that can be used for the farmers walk. These can also be performed with heavy dumbbells or short bars if these implements aren't available. Begin by standing between the implements.",
   "After gripping the handles, lift them up by driving through your heels, keeping your back straight and your head up.",
   "Walk taking short, quick steps, and don't forget to breathe. Move for a given distance, typically 50-100 feet, as fast as possible."
  ],
  "move": "core",
  "stepsZh": [
   "農夫走路可以使用專用器材，沒有的話也可以用重的啞鈴或短槓代替。先站在兩個器材中間。",
   "握緊握把，用腳跟發力把重量提起，背部打直、抬頭。",
   "用小而快的步伐往前走，記得要呼吸。以最快速度走完指定距離，通常約 15～30 公尺。"
  ]
 },
 {
  "id": "rowing-stationary",
  "zh": "划船機",
  "en": "Rowing, Stationary",
  "equip": "cardio",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "biceps",
   "calves",
   "glutes",
   "hamstrings",
   "lower back",
   "middle back"
  ],
  "level": "intermediate",
  "compound": false,
  "cue": "腿先推、身體後倒、最後手拉，回來順序相反",
  "steps": [
   "To begin, seat yourself on the rower. Make sure that your heels are resting comfortably against the base of the foot pedals and that the straps are secured. Select the program that you wish to use, if applicable. Sit up straight and bend forward at the hips.",
   "There are three phases of movement when using a rower. The first phase is when you come forward on the rower. Your knees are bent and against your chest. Your upper body is leaning slightly forward while still maintaining good posture. Next, push against the foot pedals and extend your legs while bringing your hands to your upper abdominal area, squeezing your shoulders back as you do so. To avoid straining your back, use primarily your leg and hip muscles.",
   "The recovery phase simply involves straightening your arms, bending the knees, and bringing your body forward again as you transition back into the first phase."
  ],
  "move": "cardio",
  "stepsZh": [
   "坐上划船機，腳跟舒適地靠在踏板底部，綁好腳帶。如有需要，選擇想用的訓練模式。坐直，從髖部往前傾。",
   "划船分三個階段。第一階段是身體往前滑：膝蓋彎曲靠近胸口，上半身微微前傾，但仍保持良好姿勢。接著，腳踩踏板把腿推直，同時把手拉到上腹部，肩膀往後夾。注意：主要用腿和髖部的力量，避免拉傷下背。",
   "回復階段：手臂伸直、膝蓋彎曲，身體再往前滑，回到第一階段。"
  ]
 },
 {
  "id": "jogging-treadmill",
  "zh": "跑步機",
  "en": "Jogging, Treadmill",
  "equip": "cardio",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "從快走開始，慢慢加速",
  "steps": [
   "To begin, step onto the treadmill and select the desired option from the menu. Most treadmills have a manual setting, or you can select a program to run. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. Elevation can be adjusted to change the intensity of the workout.",
   "Treadmills offer convenience, cardiovascular benefits, and usually have less impact than jogging outside. A 150 lb person will burn almost 250 calories jogging for 30 minutes, compared to more than 450 calories running. Maintain proper posture as you jog, and only hold onto the handles when necessary, such as when dismounting or checking your heart rate."
  ],
  "move": "cardio",
  "stepsZh": [
   "站上跑步機，從選單選擇想要的模式。大多數跑步機有手動模式，也可以選內建課程。通常可以輸入年齡和體重來估算消耗的熱量。調整坡度可以改變訓練強度。",
   "跑步機方便、對心肺有益，衝擊通常也比戶外慢跑小。體重約 68 公斤的人慢跑 30 分鐘約消耗 250 大卡，跑步則超過 450 大卡。慢跑時保持良好姿勢，只有在必要時才抓扶手，例如下機或量心率時。"
  ]
 },
 {
  "id": "bicycling-stationary",
  "zh": "飛輪／健身車",
  "en": "Bicycling, Stationary",
  "equip": "cardio",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "座椅高度讓腳踩到底時膝蓋微彎",
  "steps": [
   "To begin, seat yourself on the bike and adjust the seat to your height.",
   "Select the desired option from the menu. You may have to start pedaling to turn it on. You can use the manual setting, or you can select a program to use. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. The level of resistance can be changed throughout the workout. The handles can be used to monitor your heart rate to help you stay at an appropriate intensity."
  ],
  "move": "cardio",
  "stepsZh": [
   "坐上健身車，把座椅調整到適合你身高的高度。",
   "從選單選擇想要的模式，有些機器需要先踩動才會開機。可以用手動模式或選內建課程。通常可以輸入年齡和體重來估算消耗的熱量。訓練中可以隨時調整阻力。握住把手可以量心率，幫你維持適當強度。"
  ]
 },
 {
  "id": "elliptical-trainer",
  "zh": "滑步機",
  "en": "Elliptical Trainer",
  "equip": "cardio",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": false,
  "cue": "對膝蓋負擔小，適合暖身或有氧",
  "steps": [
   "To begin, step onto the elliptical and select the desired option from the menu. Most ellipticals have a manual setting, or you can select a program to run. Typically, you can enter your age and weight to estimate the amount of calories burned during exercise. Elevation can be adjusted to change the intensity of the workout.",
   "The handles can be used to monitor your heart rate to help you stay at an appropriate intensity."
  ],
  "move": "cardio",
  "stepsZh": [
   "站上滑步機，從選單選擇想要的模式。大多數滑步機有手動模式，也可以選內建課程。通常可以輸入年齡和體重來估算消耗的熱量。調整坡度可以改變訓練強度。",
   "握住把手可以量心率，幫你維持適當強度。"
  ]
 },
 {
  "id": "rope-jumping",
  "zh": "跳繩",
  "en": "Rope Jumping",
  "equip": "cardio",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": false,
  "cue": "用手腕轉繩，前腳掌輕輕跳",
  "steps": [
   "Hold an end of the rope in each hand. Position the rope behind you on the ground. Raise your arms up and turn the rope over your head bringing it down in front of you. When it reaches the ground, jump over it. Find a good turning pace that can be maintained. Different speeds and techniques can be used to introduce variation.",
   "Rope jumping is exciting, challenges your coordination, and requires a lot of energy. A 150 lb person will burn about 350 calories jumping rope for 30 minutes, compared to over 450 calories running."
  ],
  "move": "cardio",
  "stepsZh": [
   "雙手各握住繩子一端，把繩子放在身後地上。抬起手臂，將繩子從頭上甩到身前，繩子碰到地面時跳過去。找到一個可以持續的甩繩節奏，也可以變換速度和跳法增加變化。",
   "跳繩有趣、能訓練協調性，也很消耗體力。體重約 68 公斤的人跳繩 30 分鐘約消耗 350 大卡，跑步則超過 450 大卡。"
  ]
 },
 {
  "id": "box-jump-multiple-response",
  "zh": "跳箱",
  "en": "Box Jump (Multiple Response)",
  "equip": "body",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "abductors",
   "adductors",
   "calves",
   "glutes",
   "quadriceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "雙腳一起跳上箱子，落地屈膝緩衝",
  "steps": [
   "Assume a relaxed stance facing the box or platform approximately an arm's length away. Arms should be down at the sides and legs slightly bent.",
   "Using the arms to aid in the initial burst, jump upward and forward, landing with feet simultaneously on top of the box or platform.",
   "Immediately drop or jump back down to the original starting place; then repeat the sequence."
  ],
  "move": "cardio",
  "stepsZh": [
   "面對跳箱或平台放鬆站好，距離約一個手臂長。雙手自然垂放在身側，膝蓋微彎。",
   "利用手臂擺動幫助起跳，往上往前跳，雙腳同時落在跳箱上。",
   "馬上往下跳回原來的位置，接著連續重複。"
  ]
 },
 {
  "id": "ab-crunch-machine",
  "zh": "捲腹機",
  "en": "Ab Crunch Machine",
  "equip": "machine",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": false,
  "cue": "用腹肌發力捲曲，腿部放鬆不借力",
  "steps": [
   "Select a light resistance and sit down on the ab machine placing your feet under the pads provided and grabbing the top handles. Your arms should be bent at a 90 degree angle as you rest the triceps on the pads provided. This will be your starting position.",
   "At the same time, begin to lift the legs up as you crunch your upper torso. Breathe out as you perform this movement. Tip: Be sure to use a slow and controlled motion. Concentrate on using your abs to move the weight while relaxing your legs and feet.",
   "After a second pause, slowly return to the starting position as you breathe in.",
   "Repeat the movement for the prescribed amount of repetitions."
  ],
  "stepsZh": [
   "選較輕的重量，坐上腹部訓練機，雙腳勾在腳墊下，雙手抓住上方握把。手肘彎曲 90 度，三頭靠在護墊上，這是起始姿勢。",
   "吐氣，上半身往下捲的同時把雙腿往上抬。小提醒：動作要慢、要控制，專心用腹肌推動重量，腿和腳放鬆。",
   "停 1 秒後，吸氣，慢慢回到起始姿勢。",
   "依建議次數重複。"
  ],
  "move": "core"
 },
 {
  "id": "alternating-cable-shoulder-press",
  "zh": "交替繩索肩推",
  "en": "Alternating Cable Shoulder Press",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "抬頭挺胸，單側往頭頂正上方推",
  "steps": [
   "Move the cables to the bottom of the tower and select an appropriate weight.",
   "Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.",
   "Keeping your head and chest up, extend through the elbow to press one side directly over head.",
   "After pausing at the top, return to the starting position and repeat on the opposite side."
  ],
  "stepsZh": [
   "把兩側滑輪調到最低位置，選擇適當重量。",
   "抓住握把舉到肩膀高度，掌心朝前，這是起始姿勢。",
   "保持抬頭挺胸，伸直手肘，把一側往頭頂正上方推。",
   "在頂點停一下，回到起始姿勢，再換另一側。"
  ],
  "move": "push"
 },
 {
  "id": "bent-over-low-pulley-side-lateral",
  "zh": "俯身單手滑輪側平舉",
  "en": "Bent Over Low-Pulley Side Lateral",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "lower back",
   "middle back",
   "traps"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "上身近乎平行地面，手肘微彎往側抬",
  "steps": [
   "Select a weight and hold the handle of the low pulley with your right hand.",
   "Bend at the waist until your torso is nearly parallel to the floor. Your legs should be slightly bent with your left hand placed on your lower left thigh. Your right arm should be hanging from your shoulder in front of you and with a slight bend at the elbow. This will be your starting position.",
   "Raise your right arm, elbow slightly bent, to the side until the arm is parallel to the floor and in line with your right ear. Breathe out as you perform this step.",
   "Slowly lower the weight back to the starting position as you breathe in.",
   "Repeat for the recommended amount of repetitions and repeat the movement with the other arm."
  ],
  "stepsZh": [
   "選好重量，右手抓住低位滑輪的握把。",
   "從腰部彎下，讓上半身幾乎與地面平行。膝蓋微彎，左手撐在左大腿下方。右手臂自然垂在肩膀前方，手肘微彎，這是起始姿勢。",
   "吐氣，手肘保持微彎，把右手臂往側邊抬起，直到手臂與地面平行、與右耳成一直線。",
   "吸氣，慢慢放回起始位置。",
   "完成建議次數後，換另一隻手重複。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-chest-press",
  "zh": "繩索推胸",
  "en": "Cable Chest Press",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "肩胛骨後收，全程保持繩索張力",
  "steps": [
   "Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your head and chest up. The elbows should be bent to about 90 degrees. This will be your starting position.",
   "Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the movement.",
   "After pausing at full extension, return to th starting position, keeping tension on the cables.",
   "You can also execute this movement with your back off the pad, at an incline or decline, or alternate hands."
  ],
  "stepsZh": [
   "調好重量後坐下，抓住握把。上臂與身體約成 45 度，抬頭挺胸，手肘彎曲約 90 度，這是起始姿勢。",
   "伸直手肘，把握把往正前方推並向中間靠攏。過程中肩胛骨保持往後收。",
   "手臂伸直時停一下，再回到起始位置，全程讓繩索保持張力。",
   "變化式：也可以背部離開靠墊、改成上斜或下斜角度，或左右手交替推。"
  ],
  "move": "push"
 },
 {
  "id": "cable-deadlifts",
  "zh": "繩索硬舉",
  "en": "Cable Deadlifts",
  "equip": "cable",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "forearms",
   "glutes",
   "hamstrings",
   "lower back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "腳跟發力站起，全程抬頭挺胸",
  "steps": [
   "Move the cables to the bottom of the towers and select an appropriate weight. Stand directly in between the uprights.",
   "To begin, squat down be flexing your hips and knees until you can reach the handles.",
   "After grasping them, begin your ascent. Driving through your heels extend your hips and knees keeping your hands hanging at your side. Keep your head and chest up throughout the movement.",
   "After reaching a full standing position, Return to the starting position and repeat."
  ],
  "stepsZh": [
   "把兩側滑輪調到最低位置，選擇適當重量，站在兩根立柱正中間。",
   "彎曲髖部和膝蓋往下蹲，直到可以抓到握把。",
   "抓好後開始站起：用腳跟發力，伸直髖部和膝蓋，雙手自然垂在身側。全程抬頭挺胸。",
   "完全站直後，回到起始姿勢再重複。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-hammer-curls---rope-attachment",
  "zh": "繩索錘式彎舉",
  "en": "Cable Hammer Curls - Rope Attachment",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘貼緊身側，只有前臂移動",
  "steps": [
   "Attach a rope attachment to a low pulley and stand facing the machine about 12 inches away from it.",
   "Grasp the rope with a neutral (palms-in) grip and stand straight up keeping the natural arch of the back and your torso stationary.",
   "Put your elbows in by your side and keep them there stationary during the entire movement. Tip: Only the forearms should move; not your upper arms. This will be your starting position.",
   "Using your biceps, pull your arms up as you exhale until your biceps touch your forearms. Tip: Remember to keep the elbows in and your upper arms stationary.",
   "After a 1 second contraction where you squeeze your biceps, slowly start to bring the weight back to the original position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把繩索握把裝在低位滑輪上，面向機器站在約 30 公分遠的位置。",
   "以掌心相對的握法握住繩索，站直，保持背部自然弧度，軀幹不動。",
   "手肘貼在身體兩側，整個動作都固定不動。小提醒：只有前臂動，上臂不要動。這是起始姿勢。",
   "吐氣，用二頭把手往上彎舉，直到二頭碰到前臂。小提醒：記得手肘夾緊、上臂不動。",
   "在頂點用力收縮二頭 1 秒，再慢慢把重量放回原位。",
   "依建議次數重複。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-hip-adduction",
  "zh": "繩索髖內收",
  "en": "Cable Hip Adduction",
  "equip": "cable",
  "primary": [
   "quadriceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "用大腿內側發力，上身保持穩定",
  "steps": [
   "Stand in front of a low pulley facing forward with one leg next to the pulley and the other one away.",
   "Attach the ankle cuff to the cable and also to the ankle of the leg that is next to the pulley.",
   "Now step out and away from the stack with a wide stance and grasp the bar of the pulley system.",
   "Stand on the foot that does not have the ankle cuff (the far foot) and allow the leg with the cuff to be pulled towards the low pulley. This will be your starting position.",
   "Now perform the movement by moving the leg with the ankle cuff in front of the far leg by using the inner thighs to abduct the hip. Breathe out during this portion of the movement.",
   "Slowly return to the starting position as you breathe in.",
   "Repeat for the recommended amount of repetitions and then repeat the same movement with the opposite leg."
  ],
  "stepsZh": [
   "站在低位滑輪前方面向前，一腳靠近滑輪，另一腳在外側。",
   "把腳踝綁帶扣在繩索上，再綁到靠近滑輪那隻腳的腳踝。",
   "往外跨一步遠離配重片，雙腳站寬，手抓住機器的橫桿。",
   "用沒綁綁帶的那隻腳（外側腳）站穩，讓綁著綁帶的腳被拉向滑輪，這是起始姿勢。",
   "吐氣，用大腿內側發力，把綁帶腳往內拉到外側腳的前方。",
   "吸氣，慢慢回到起始姿勢。",
   "完成建議次數後，換另一腳重複。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-incline-pushdown",
  "zh": "上斜滑輪直臂下拉",
  "en": "Cable Incline Pushdown",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手臂保持伸直，用背闊肌把桿拉回",
  "steps": [
   "Lie on incline an bench facing away from a high pulley machine that has a straight bar attachment on it.",
   "Grasp the straight bar attachment overhead with a pronated (overhand; palms down) shoulder width grip and extend your arms in front of you. The bar should be around 2 inches away from your upper thighs. This will be your starting position.",
   "Keeping the upper arms stationary, lift your arms back in a semi circle until the bar is straight over your head. Breathe in during this portion of the movement.",
   "Slowly go back to the starting position using your lats and hold the contraction once you reach the starting position. Breathe out during the execution of this movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "躺在上斜椅上，背對裝有直桿的高位滑輪。",
   "雙手在頭上方以正手（掌心朝下）、與肩同寬的握距抓住直桿，手臂往前伸直，直桿離大腿上方約 5 公分，這是起始姿勢。",
   "上臂保持固定，吸氣，手臂往後畫半圓，直到直桿在頭頂正上方。",
   "吐氣，用背闊肌發力把直桿拉回起始位置，到位後停一下感受收縮。",
   "依建議次數重複。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-incline-triceps-extension",
  "zh": "上斜滑輪三頭伸展",
  "en": "Cable Incline Triceps Extension",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂固定不動，只靠三頭伸直手臂",
  "steps": [
   "Lie on incline an bench facing away from a high pulley machine that has a straight bar attachment on it.",
   "Grasp the straight bar attachment overhead with a pronated (overhand; palms down) narrow grip (less than shoulder width) and keep your elbows tucked in to your sides. Your upper arms should create around a 25 degree angle when measured from the floor.",
   "Keeping the upper arms stationary, extend the arms as you flex the triceps. Breathe out during this portion of the movement and hold the contraction for a second.",
   "Slowly go back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "躺在上斜椅上，背對裝有直桿的高位滑輪。",
   "雙手在頭上方以正手（掌心朝下）窄握（比肩窄）抓住直桿，手肘往內收。上臂與地面約成 25 度。",
   "上臂保持不動，收縮三頭把手臂伸直。吐氣，在伸直時停 1 秒。",
   "慢慢回到起始位置。",
   "依建議次數重複。"
  ],
  "move": "push"
 },
 {
  "id": "cable-internal-rotation",
  "zh": "繩索肩內旋",
  "en": "Cable Internal Rotation",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": true,
  "cue": "手肘貼緊身側，只轉動肩膀",
  "steps": [
   "Sit next to a low pulley sideways (with legs stretched in front of you or crossed) and grasp the single hand cable attachment with the arm nearest to the cable. Tip: If you can adjust the pulley's height, you can use a flat bench to sit on instead.",
   "Position the elbow against your side with the elbow bent at 90° and the arm pointing towards the pulley. This will be your starting position.",
   "Pull the single hand cable attachment toward your body by internally rotating your shoulder until your forearm is across your abs. You will be creating an imaginary semi-circle. Tip: The forearm should be perpendicular to your torso at all times.",
   "Slowly go back to the initial position.",
   "Repeat for the recommended amount of repetitions and then repeat the movement with the next arm."
  ],
  "stepsZh": [
   "側身坐在低位滑輪旁（雙腿往前伸或盤腿），用靠近滑輪那隻手抓住單手握把。小提醒：如果滑輪高度可調，也可以坐在臥推椅上做。",
   "手肘貼在身側、彎曲 90 度，前臂指向滑輪，這是起始姿勢。",
   "肩膀往內旋轉，把握把拉向身體，直到前臂橫在腹部前，像畫一個半圓。小提醒：前臂要一直與軀幹保持垂直。",
   "慢慢回到起始位置。",
   "完成建議次數後，換另一隻手重複。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-iron-cross",
  "zh": "繩索十字下拉",
  "en": "Cable Iron Cross",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘伸直，雙臂從兩側往下拉",
  "steps": [
   "Begin by moving the pulleys to the high position, select the resistance to be used, and take a handle in each hand.",
   "Stand directly between both pulleys with your arms extended out to your sides. Your head and chest should be up while your arms form a \"T\". This will be your starting position.",
   "Keeping the elbows extended, pull your arms straight to your sides.",
   "Return your arms back to the starting position after a pause at the peak contraction.",
   "Continue the movement for the prescribed number of repetitions."
  ],
  "stepsZh": [
   "把兩側滑輪調到高位，選好重量，雙手各抓一個握把。",
   "站在兩個滑輪正中間，手臂往兩側伸直，抬頭挺胸，身體呈「T」字形，這是起始姿勢。",
   "手肘保持伸直，把手臂往身體兩側往下拉。",
   "在收縮最緊的位置停一下，再把手臂放回起始位置。",
   "依建議次數持續進行。"
  ],
  "move": "push"
 },
 {
  "id": "cable-lying-triceps-extension",
  "zh": "仰臥滑輪三頭伸展",
  "en": "Cable Lying Triceps Extension",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂固定、手肘內收，只動前臂",
  "steps": [
   "Lie on a flat bench and grasp the straight bar attachment of a low pulley with a narrow overhand grip. Tip: The easiest way to do this is to have someone hand you the bar as you lay down.",
   "With your arms extended, position the bar over your torso. Your arms and your torso should create a 90-degree angle. This will be your starting position.",
   "Lower the bar by bending at the elbow while keeping the upper arms stationary and elbows in. Go down until the bar lightly touches your forehead. Breathe in as you perform this portion of the movement.",
   "Flex the triceps as you lift the bar back to its starting position. Exhale as you perform this portion of the movement.",
   "Hold for a second at the contracted position and repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "躺在平板臥推椅上，以正手窄握抓住低位滑輪上的直桿。小提醒：最簡單的方式是躺下時請人把直桿遞給你。",
   "手臂伸直，把直桿舉在胸口上方，手臂與軀幹成 90 度，這是起始姿勢。",
   "吸氣，上臂固定、手肘內收，彎曲手肘把直桿往下放，直到輕碰額頭。",
   "吐氣，收縮三頭把直桿推回起始位置。",
   "在頂點停 1 秒，依建議次數重複。"
  ],
  "move": "push"
 },
 {
  "id": "cable-one-arm-tricep-extension",
  "zh": "單手反握三頭下壓",
  "en": "Cable One Arm Tricep Extension",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂貼緊身側，只有前臂移動",
  "steps": [
   "With your right hand, grasp a single handle attached to the high-cable pulley using a supinated (underhand; palms facing up) grip. You should be standing directly in front of the weight stack.",
   "Now pull the handle down so that your upper arm and elbow are locked in to the side of your body. Your upper arm and forearm should form an acute angle (less than 90-degrees). You can keep the other arm by the waist and you can have one leg in front of you and the other one back for better balance. This will be your starting position.",
   "As you contract the triceps, move the single handle attachment down to your side until your arm is straight. Breathe out as you perform this movement. Tip: Only the forearms should move. Your upper arms should remain stationary at all times.",
   "Squeeze the triceps and hold for a second in this contracted position.",
   "Slowly return the handle to the starting position.",
   "Repeat for the recommended amount of repetitions and then perform the same movement with the other arm."
  ],
  "stepsZh": [
   "面對配重片站好，右手以反手（掌心朝上）抓住高位滑輪上的單手握把。",
   "把握把往下拉，讓上臂和手肘固定貼在身體側邊，上臂與前臂夾角小於 90 度。另一手可以扶在腰間，雙腳可一前一後站以增加穩定，這是起始姿勢。",
   "吐氣，收縮三頭，把握把往下推到手臂伸直。小提醒：只有前臂動，上臂全程固定不動。",
   "用力夾緊三頭，在底部停 1 秒。",
   "慢慢把握把放回起始位置。",
   "完成建議次數後，換另一隻手重複。"
  ],
  "move": "push"
 },
 {
  "id": "cable-preacher-curl",
  "zh": "滑輪牧師椅彎舉",
  "en": "Cable Preacher Curl",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [
   "forearms"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "上臂貼緊椅墊，慢慢放下不要甩",
  "steps": [
   "Place a preacher bench about 2 feet in front of a pulley machine.",
   "Attach a straight bar to the low pulley.",
   "Sit at the preacher bench with your elbow and upper arms firmly on top of the bench pad and have someone hand you the bar from the low pulley.",
   "Grab the bar and fully extend your arms on top of the preacher bench pad. This will be your starting position.",
   "Now start pilling the weight up towards your shoulders and squeeze the biceps hard at the top of the movement. Exhale as you perform this motion. Also, hold for a second at the top.",
   "Now slowly lower the weight to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把牧師椅放在滑輪機前方約 60 公分處。",
   "在低位滑輪裝上直桿。",
   "坐上牧師椅，手肘和上臂穩穩貼在椅墊上，請人把低位滑輪的直桿遞給你。",
   "握住直桿，手臂在椅墊上完全伸直，這是起始姿勢。",
   "吐氣，把重量往肩膀方向彎舉上來，在頂點用力收縮二頭並停 1 秒。",
   "慢慢把重量放回起始位置。",
   "依建議次數重複。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-rear-delt-fly",
  "zh": "繩索後三角飛鳥",
  "en": "Cable Rear Delt Fly",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手臂伸直往後外拉，用後肩發力",
  "steps": [
   "Adjust the pulleys to the appropriate height and adjust the weight. The pulleys should be above your head.",
   "Grab the left pulley with your right hand and the right pulley with your left hand, crossing them in front of you. This will be your starting position.",
   "Initiate the movement by moving your arms back and outward, keeping your arms straight as you execute the movement.",
   "Pause at the end of the motion before returning the handles to the start position."
  ],
  "stepsZh": [
   "把滑輪調到高於頭部的位置，並設定重量。",
   "右手抓左邊滑輪，左手抓右邊滑輪，雙手在身前交叉，這是起始姿勢。",
   "手臂保持伸直，往後、往外拉開。",
   "在動作末端停一下，再把握把放回起始位置。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-reverse-crunch",
  "zh": "繩索反向捲腹",
  "en": "Cable Reverse Crunch",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "慢慢放下，腹肌全程保持張力",
  "steps": [
   "Connect an ankle strap attachment to a low pulley cable and position a mat on the floor in front of it.",
   "Sit down with your feet toward the pulley and attach the cable to your ankles.",
   "Lie down, elevate your legs and bend your knees at a 90-degree angle. Your legs and the cable should be aligned. If not, adjust the pulley up or down until they are.",
   "With your hands behind your head, bring your knees inward to your torso and elevate your hips off the floor.",
   "Pause for a moment and in a slow and controlled manner drop your hips and bring your legs back to the starting 90-degree angle. You should still have tension on your abs in the resting position.",
   "Repeat the same movement to failure."
  ],
  "stepsZh": [
   "在低位滑輪接上腳踝綁帶，並在前方地上鋪好墊子。",
   "坐下，雙腳朝向滑輪，把繩索扣在腳踝上。",
   "躺下，抬起雙腿，膝蓋彎曲 90 度。腿要和繩索成一直線，如果沒有，就上下調整滑輪高度。",
   "雙手放在頭後，把膝蓋往軀幹方向收，同時讓臀部離地。",
   "停一下，再慢慢、有控制地放下臀部，讓腿回到 90 度的起始姿勢。回到起始位置時腹肌仍要保持張力。",
   "重複到力竭為止。"
  ],
  "move": "core"
 },
 {
  "id": "cable-rope-rear-delt-rows",
  "zh": "繩索後三角划船",
  "en": "Cable Rope Rear-Delt Rows",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "biceps",
   "middle back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "手肘抬高向外，拉向上胸",
  "steps": [
   "Sit in the same position on a low pulley row station as you would if you were doing seated cable rows for the back.",
   "Attach a rope to the pulley and grasp it with an overhand grip. Your arms should be extended and parallel to the floor with the elbows flared out.",
   "Keep your lower back upright and slide your hips back so that your knees are slightly bent. This will be your starting position.",
   "Pull the cable attachment towards your upper chest, just below the neck, as you keep your elbows up and out to the sides. Continue this motion as you exhale until the elbows travel slightly behind the back. Tip: Keep your upper arms horizontal, perpendicular to the torso and parallel to the floor throughout the motion.",
   "Go back to the initial position where the arms are extended and the shoulders are stretched forward. Inhale as you perform this portion of the movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "坐在低位滑輪划船機上，姿勢跟做一般坐姿滑輪划船一樣。",
   "在滑輪上裝繩索握把，以正手握住。手臂伸直、與地面平行，手肘向外打開。",
   "下背保持挺直，臀部往後坐，讓膝蓋微彎，這是起始姿勢。",
   "吐氣，手肘抬高往兩側打開，把繩索拉向上胸（脖子下方），直到手肘稍微超過背部。小提醒：全程讓上臂保持水平，與軀幹垂直、與地面平行。",
   "吸氣，回到手臂伸直、肩膀往前伸展的起始位置。",
   "依建議次數重複。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-russian-twists",
  "zh": "繩索俄羅斯轉體",
  "en": "Cable Russian Twists",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": true,
  "cue": "臀部抬高、核心收緊，慢慢轉體",
  "steps": [
   "Connect a standard handle attachment, and position the cable to a middle pulley position.",
   "Lie on a stability ball perpendicular to the cable and grab the handle with one hand. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable.",
   "Grab the handle with both hands and fully extend your arms above your chest. You hands should be directly in-line with the pulley. If not, adjust the pulley up or down until they are.",
   "Keep your hips elevated and abs engaged. Rotate your torso away from the pulley for a full-quarter rotation. Your body should be flat from head to knees.",
   "Pause for a moment and in a slow and controlled manner reset to the starting position. You should still have side tension on the cable in the resting position.",
   "Repeat the same movement to failure.",
   "Then, reposition and repeat the same series of movements on the opposite side."
  ],
  "stepsZh": [
   "在滑輪上裝標準握把，把滑輪調到中間高度。",
   "躺在抗力球上，身體與繩索垂直，單手抓住握把。距離滑輪約一個手臂長，讓繩索有張力。",
   "雙手一起握住握把，手臂在胸口上方伸直。雙手要和滑輪成一直線，如果沒有，就上下調整滑輪高度。",
   "臀部保持抬高、腹肌收緊，上半身往遠離滑輪的方向轉 90 度。從頭到膝蓋要保持一直線。",
   "停一下，再慢慢、有控制地轉回起始位置。回到起始位置時繩索仍要保持側向張力。",
   "重複到力竭為止。",
   "接著換邊站好，另一側重複同樣動作。"
  ],
  "move": "core"
 },
 {
  "id": "cable-seated-crunch",
  "zh": "坐姿繩索捲腹",
  "en": "Cable Seated Crunch",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "髖部不動，用腹肌把上身往前捲",
  "steps": [
   "Seat on a flat bench with your back facing a high pulley.",
   "Grasp the cable rope attachment with both hands (with the palms of the hands facing each other) and place your hands securely over both shoulders. Tip: Allow the weight to hyperextend the lower back slightly. This will be your starting position.",
   "With the hips stationary, flex the waist so the elbows travel toward the hips. Breathe out as you perform this step.",
   "As you inhale, go back to the initial position slowly.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "背對高位滑輪，坐在平板臥推椅上。",
   "雙手以掌心相對的方式抓住繩索握把，把手穩穩放在兩側肩膀上。小提醒：讓重量把下背稍微往後拉伸。這是起始姿勢。",
   "髖部固定不動，吐氣，把腰往前捲，讓手肘往髖部移動。",
   "吸氣，慢慢回到起始姿勢。",
   "依建議次數重複。"
  ],
  "move": "core"
 },
 {
  "id": "cable-shoulder-press",
  "zh": "繩索肩推",
  "en": "Cable Shoulder Press",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "抬頭挺胸，握把往頭頂正上方推",
  "steps": [
   "Move the cables to the bottom of the towers and select an appropriate weight.",
   "Stand directly in between the uprights. Grasp the cables and hold them at shoulder height, palms facing forward. This will be your starting position.",
   "Keeping your head and chest up, extend through the elbow to press the handles directly over head.",
   "After pausing at the top, return to the starting position and repeat."
  ],
  "stepsZh": [
   "把兩側滑輪調到最低位置，選擇適當重量。",
   "站在兩根立柱正中間，抓住握把舉到肩膀高度，掌心朝前，這是起始姿勢。",
   "保持抬頭挺胸，伸直手肘，把握把往頭頂正上方推。",
   "在頂點停一下，回到起始姿勢再重複。"
  ],
  "move": "push"
 },
 {
  "id": "cable-shrugs",
  "zh": "滑輪聳肩",
  "en": "Cable Shrugs",
  "equip": "cable",
  "primary": [
   "traps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手臂打直，只靠肩膀上下移動",
  "steps": [
   "Grasp a cable bar attachment that is attached to a low pulley with a shoulder width or slightly wider overhand (palms facing down) grip.",
   "Stand erect close to the pulley with your arms extended in front of you holding the bar. This will be your starting position.",
   "Lift the bar by elevating the shoulders as high as possible as you exhale. Hold the contraction at the top for a second. Tip: The arms should remain extended at all times. Refrain from using the biceps to help lift the bar. Only the shoulders should be moving up and down.",
   "Lower the bar back to the original position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "在低位滑輪接上直桿，雙手正握（掌心朝下），握距與肩同寬或稍寬。",
   "靠近滑輪站直，手臂伸直、把直桿握在身體前方，這是起始姿勢。",
   "吐氣，肩膀盡量往上聳高，在最高點停留 1 秒。小提醒：手臂全程保持伸直，不要用二頭幫忙拉，只有肩膀上下移動。",
   "把直桿慢慢放回起始位置。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "cable-wrist-curl",
  "zh": "滑輪腕彎舉",
  "en": "Cable Wrist Curl",
  "equip": "cable",
  "primary": [
   "forearms"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "前臂貼住大腿不動，只動手腕",
  "steps": [
   "Start out by placing a flat bench in front of a low pulley cable that has a straight bar attachment.",
   "Use your arms to grab the cable bar with a narrow to shoulder width supinated grip (palms up) and bring them up so that your forearms are resting against the top of your thighs. Your wrists should be hanging just beyond your knees.",
   "Start out by curling your wrist upwards and exhaling. Keep the contraction for a second.",
   "Slowly lower your wrists back down to the starting position while inhaling.",
   "Your forearms should be stationary as your wrist is the only movement needed to perform this exercise.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "在接上直桿的低位滑輪前方放一張平板臥推椅。",
   "雙手反握（掌心朝上）直桿，握距窄於或等於肩寬，前臂靠在大腿上，手腕懸在膝蓋前方。",
   "吐氣，手腕往上捲起，在頂端停留 1 秒。",
   "吸氣，手腕慢慢放回起始位置。",
   "前臂保持不動，整個動作只有手腕在動。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "calf-machine-shoulder-shrug",
  "zh": "提踵機聳肩",
  "en": "Calf-Machine Shoulder Shrug",
  "equip": "machine",
  "primary": [
   "traps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "肩膀往耳朵方向聳，頂端停 1 秒",
  "steps": [
   "Position yourself on the calf machine so that the shoulder pads are above your shoulders. Your torso should be straight with the arms extended normally by your side. This will be your starting position.",
   "Raise your shoulders up towards your ears as you exhale and hold the contraction for a full second.",
   "Slowly return to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "站上提踵機，讓肩墊壓在肩膀上方。上身挺直，手臂自然垂放在身體兩側，這是起始姿勢。",
   "吐氣，肩膀往耳朵方向聳起，停留 1 秒。",
   "吸氣，慢慢回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "calf-press",
  "zh": "機械小腿推舉",
  "en": "Calf Press",
  "equip": "machine",
  "primary": [
   "calves"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "用前腳掌推到底，膝蓋保持不動",
  "steps": [
   "Adjust the seat so that your legs are only slightly bent in the start position. The balls of your feet should be firmly on the platform.",
   "Select an appropriate weight, and grasp the handles. This will be your starting position.",
   "Straighten the legs by extending the knees, just barely lifting the weight from the stack. Your ankle should be fully flexed, toes pointing up. Execute the movement by pressing downward through the balls of your feet as far as possible.",
   "After a brief pause, reverse the motion and repeat."
  ],
  "stepsZh": [
   "調整座椅，讓起始時雙腿只微微彎曲，前腳掌穩穩踩在踏板上。",
   "選好適當重量，握住握把，這是起始姿勢。",
   "伸直膝蓋，讓配重片剛好離開，腳踝完全勾起、腳尖朝上。接著用前腳掌盡量往下推。",
   "稍停一下，再慢慢回到原位並重複。"
  ],
  "move": "push"
 },
 {
  "id": "calf-press-on-the-leg-press-machine",
  "zh": "腿推機提踵",
  "en": "Calf Press On The Leg Press Machine",
  "equip": "machine",
  "primary": [
   "calves"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "膝蓋固定不彎，只用腳踝推動",
  "steps": [
   "Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a medium (shoulder width) foot stance.",
   "Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of you without locking your knees. (Note: In some leg press units you can leave the safety bars on for increased safety. If your leg press unit allows for this, then this is the preferred method of performing the exercise.) Your torso and the legs should make perfect 90-degree angle. Now carefully place your toes and balls of your feet on the lower portion of the platform with the heels extending off. Toes should be facing forward, outwards or inwards as described at the beginning of the chapter. This will be your starting position.",
   "Press on the platform by raising your heels as you breathe out by extending your ankles as high as possible and flexing your calf. Ensure that the knee is kept stationary at all times. There should be no bending at any time. Hold the contracted position by a second before you start to go back down.",
   "Go back slowly to the starting position as you breathe in by lowering your heels as you bend the ankles until calves are stretched.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "坐上腿推機，雙腳踩在正前方的踏板上，與肩同寬。",
   "放下固定踏板的安全桿，把踏板推到雙腿伸直，但膝蓋不要鎖死。（注意：有些腿推機可以保留安全桿，如果可以，建議這樣做更安全。）上身和雙腿約呈 90 度。接著小心把腳尖和前腳掌踩在踏板下緣，腳跟懸空。腳尖可朝前、朝外或朝內。這是起始姿勢。",
   "吐氣，抬起腳跟、腳踝盡量伸展推動踏板，收緊小腿。膝蓋全程不動、不可彎曲。在頂端停留 1 秒再往下。",
   "吸氣，慢慢放下腳跟、彎曲腳踝，直到小腿有伸展感，回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "dip-machine",
  "zh": "坐姿撐體機",
  "en": "Dip Machine",
  "equip": "machine",
  "primary": [
   "triceps"
  ],
  "secondary": [
   "chest",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "手肘夾緊身體，底部手臂微彎",
  "steps": [
   "Sit securely in a dip machine, select the weight and firmly grasp the handles.",
   "Now keep your elbows in at your sides in order to place emphasis on the triceps. The elbows should be bent at a 90 degree angle.",
   "As you contract the triceps, extend your arms downwards as you exhale. Tip: At the bottom of the movement, focus on keeping a little bend in your arms to keep tension on the triceps muscle.",
   "Now slowly let your arms come back up to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "在撐體機上坐穩，選好重量，雙手握緊握把。",
   "手肘夾在身體兩側，讓三頭出力，手肘約彎曲 90 度。",
   "吐氣，收縮三頭把手臂往下推直。小提醒：到底部時手臂保留一點彎曲，讓三頭持續受力。",
   "吸氣，讓手臂慢慢回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "elevated-cable-rows",
  "zh": "墊高坐姿滑輪划船",
  "en": "Elevated Cable Rows",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "middle back",
   "traps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "上身固定，把握把拉到腹部並夾背",
  "steps": [
   "Get a platform of some sort (it can be an aerobics or calf raise platform) that is around 4-6 inches in height.",
   "Place it on the seat of the cable row machine.",
   "Sit down on the machine and place your feet on the front platform or crossbar provided making sure that your knees are slightly bent and not locked.",
   "Lean over as you keep the natural alignment of your back and grab the V-bar handles.",
   "With your arms extended pull back until your torso is at a 90-degree angle from your legs. Your back should be slightly arched and your chest should be sticking out. You should be feeling a nice stretch on your lats as you hold the bar in front of you. This is the starting position of the exercise.",
   "Keeping the torso stationary, pull the handles back towards your torso while keeping the arms close to it until you touch the abdominals. Breathe out as you perform that movement. At that point you should be squeezing your back muscles hard. Hold that contraction for a second and slowly go back to the original position while breathing in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "準備一個約 10–15 公分高的墊台（例如有氧踏板或提踵踏板）。",
   "把墊台放在滑輪划船機的座椅上。",
   "坐上去，雙腳踩在前方踏板或橫桿上，膝蓋微彎、不要鎖死。",
   "保持背部自然弧度前傾，握住 V 型把。",
   "手臂伸直，把上身拉回到和大腿約呈 90 度。背部微微拱起、挺胸，背闊肌會有明顯伸展感，這是起始姿勢。",
   "上身不動，吐氣，手臂貼近身體，把握把拉向腹部直到碰到。此時用力夾緊背部肌肉，停留 1 秒，再吸氣慢慢回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "external-rotation-with-cable",
  "zh": "滑輪肩外旋",
  "en": "External Rotation with Cable",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘貼緊身體，只轉動前臂",
  "steps": [
   "Adjust the cable to the same height as your elbow. Stand with your left side to the band a couple of feet away.",
   "Grasp the handle with your right hand, and keep your elbow pressed firmly to your side. We recommend you hold a pad or foam roll in place with your elbow to keep it firmly in position.",
   "With your upper arm in position, your elbow should be flexed to 90 degrees with your hand reaching across the front of your torso. This will be your starting position.",
   "Execute the movement by rotating your arm in a backhand motion, keeping your elbow in place."
  ],
  "stepsZh": [
   "把滑輪調到與手肘同高。左側身體朝向滑輪，站在離它約 60 公分處。",
   "右手握住握把，手肘緊貼身體側邊。建議在手肘和身體間夾一個小墊子或滾筒，幫助固定位置。",
   "上臂固定，手肘彎曲 90 度，手掌橫在身體前方，這是起始姿勢。",
   "手肘保持不動，像打反手拍一樣把手臂往外旋轉。"
  ],
  "move": "pull"
 },
 {
  "id": "flat-bench-cable-flyes",
  "zh": "平板滑輪飛鳥",
  "en": "Flat Bench Cable Flyes",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": false,
  "cue": "手肘維持微彎，用胸肌把手合起",
  "steps": [
   "Position a flat bench between two low pulleys so that when you are laying on it, your chest will be lined up with the cable pulleys.",
   "Lay flat on the bench and keep your feet on the ground.",
   "Have someone hand you the handles on each hand. You will grab each single handle attachment with a palms up grip.",
   "Extend your arms by your side with a slight bend on your elbows. Tip: You will keep this bend constant through the whole movement. Your arms should be parallel to the floor. This is your starting position.",
   "Now start lifting the arms in a semi-circle motion directly in front of you by pulling the cables together until both hands meet at the top of the movement. Squeeze your chest as you perform this motion and breathe out during this movement. Also, hold the contraction for a second at the top. Tip: When performed correctly, at the top position of this movement, your arms should be perpendicular to your torso and the floor touching above your chest.",
   "Slowly come back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把平板臥推椅放在兩個低位滑輪中間，讓你躺下時胸口與滑輪對齊。",
   "躺平在椅上，雙腳踩地。",
   "請人把握把遞給你，雙手各握一個單手握把，掌心朝上。",
   "手臂往兩側打開，手肘微彎。小提醒：整個動作都要保持這個彎度。手臂與地面平行，這是起始姿勢。",
   "吐氣，雙手以半圓弧線往前上方合起，直到雙手在頂端相碰，過程中收緊胸肌，在頂端停留 1 秒。小提醒：做對的話，頂端時手臂會與身體和地面垂直，雙手在胸口上方相碰。",
   "慢慢回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "front-cable-raise",
  "zh": "單手滑輪前平舉",
  "en": "Front Cable Raise",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "身體不晃動，手臂舉到略高於水平",
  "steps": [
   "Select the weight on a low pulley machine and grasp the single hand cable attachment that is attached to the low pulley with your left hand.",
   "Face away from the pulley and put your arm straight down with the hand cable attachment in front of your thighs at arms' length with the palms of the hand facing your thighs. This will be your starting position.",
   "While maintaining the torso stationary (no swinging), lift the left arm to the front with a slight bend on the elbow and the palms of the hand always faces down. Continue to go up until you arm is slightly above parallel to the floor. Exhale as you execute this portion of the movement and pause for a second at the top.",
   "Now as you inhale lower the arm back down slowly to the starting position.",
   "Once all of the recommended amount of repetitions have been performed for this arm, switch arms and perform the exercise with the right one."
  ],
  "stepsZh": [
   "在低位滑輪選好重量，左手握住單手握把。",
   "背對滑輪站立，手臂自然下垂、握把在大腿前方，掌心朝向大腿，這是起始姿勢。",
   "身體保持不動（不要晃），手肘微彎、掌心朝下，吐氣把左手往前舉起，直到略高於與地面平行，在頂端停 1 秒。",
   "吸氣，慢慢把手臂放回起始位置。",
   "這隻手完成建議次數後，換右手做。"
  ],
  "move": "push"
 },
 {
  "id": "full-range-of-motion-lat-pulldown",
  "zh": "交叉滑輪下拉",
  "en": "Full Range-Of-Motion Lat Pulldown",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back",
   "shoulders"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "挺胸往下拉，過程中轉手讓掌心相對",
  "steps": [
   "Either standing or seated on a high bench, grasp two stirrup cables that are attached to the high pulleys. Grab with the opposing hand so your arms are crisscrossed about you and your palms are facing forward.",
   "Keeping your chest up and maintaining a slight arch in your lower back, pull the handles down as if you were doing a regular pulldown. The range of motion will be more of an arc. During the movement, rotate your hands so that in the bottom position your palms face each other rather than forward. Return slowly to the starting position and repeat."
  ],
  "stepsZh": [
   "站著或坐在高椅上，雙手交叉握住兩側高位滑輪的單手握把，手臂在頭上交叉、掌心朝前。",
   "挺胸、下背保持微拱，像一般滑輪下拉一樣往下拉，軌跡會比較像弧線。下拉時轉動手腕，到底部時掌心互相面對。再慢慢回到起始位置並重複。"
  ],
  "move": "pull"
 },
 {
  "id": "glute-ham-raise",
  "zh": "臀腿抬升",
  "en": "Glute Ham Raise",
  "equip": "machine",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "calves",
   "glutes"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "身體打直，用腳尖頂住踏板把身體拉起",
  "steps": [
   "Begin by adjusting the equipment to fit your body. Place your feet against the footplate in between the rollers as you lie facedown. Your knees should be just behind the pad.",
   "Start from the bottom of the movement. Keep your back arched as you begin the movement by flexing the knees. Drive your toes into the foot plate as you do so. Keep your upper body straight, and continue until your body is upright.",
   "Return to the starting position, keeping your descent under control."
  ],
  "stepsZh": [
   "先依體型調整器材。臉朝下趴著，雙腳抵住滾輪之間的踏板，膝蓋剛好在墊子後方。",
   "從動作底部開始，背部保持拱起，彎曲膝蓋把身體拉起，同時腳尖用力踩向踏板。上身保持挺直，直到身體立起。",
   "控制速度慢慢下放，回到起始位置。"
  ],
  "move": "pull"
 },
 {
  "id": "high-cable-curls",
  "zh": "高位滑輪彎舉",
  "en": "High Cable Curls",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": true,
  "cue": "上臂固定與地面平行，只動前臂",
  "steps": [
   "Stand between a couple of high pulleys and grab a handle in each arm. Position your upper arms in a way that they are parallel to the floor with the palms of your hands facing you. This will be your starting position.",
   "Curl the handles towards you until they are next to your ears. Make sure that as you do so you flex your biceps and exhale. The upper arms should remain stationary and only the forearms should move. Hold for a second in the contracted position as you squeeze the biceps.",
   "Slowly bring back the arms to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "站在兩個高位滑輪中間，雙手各握一個握把。上臂抬到與地面平行，掌心朝向自己，這是起始姿勢。",
   "吐氣，收縮二頭把握把往自己方向彎舉，直到靠近耳朵。上臂不動，只有前臂移動，在頂端夾緊二頭停 1 秒。",
   "慢慢把手臂放回起始位置。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "incline-cable-chest-press",
  "zh": "上斜滑輪推胸",
  "en": "Incline Cable Chest Press",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "肩胛骨後收，全程保持滑輪張力",
  "steps": [
   "Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 45 degrees to the body, with your head and chest up. The elbows should be bent to about 90 degrees. This will be your starting position.",
   "Begin by extending through the elbow, pressing the handles together straight in front of you. Keep your shoulder blades retracted as you execute the movement.",
   "After pausing at full extension, return to the starting position, keeping tension on the cables."
  ],
  "stepsZh": [
   "選好適當重量，坐下握住握把。上臂與身體約呈 45 度，抬頭挺胸，手肘彎曲約 90 度，這是起始姿勢。",
   "伸直手肘，把握把往正前方推並向中間靠攏。過程中肩胛骨保持後收。",
   "手臂伸直時稍停，再回到起始位置，全程保持滑輪有張力。"
  ],
  "move": "push"
 },
 {
  "id": "incline-cable-flye",
  "zh": "上斜滑輪飛鳥",
  "en": "Incline Cable Flye",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "intermediate",
  "compound": false,
  "cue": "手肘微彎固定，只用肩關節畫弧",
  "steps": [
   "To get yourself into the starting position, set the pulleys at the floor level (lowest level possible on the machine that is below your torso).",
   "Place an incline bench (set at 45 degrees) in between the pulleys, select a weight on each one and grab a pulley on each hand.",
   "With a handle on each hand, lie on the incline bench and bring your hands together at arms length in front of your face. This will be your starting position.",
   "With a slight bend of your elbows (in order to prevent stress at the biceps tendon), lower your arms out at both sides in a wide arc until you feel a stretch on your chest. Breathe in as you perform this portion of the movement. Tip: Keep in mind that throughout the movement, the arms should remain stationary. The movement should only occur at the shoulder joint.",
   "Return your arms back to the starting position as you squeeze your chest muscles and exhale. Hold the contracted position for a second. Tip: Make sure to use the same arc of motion used to lower the weights.",
   "Repeat the movement for the prescribed amount of repetitions."
  ],
  "stepsZh": [
   "把兩側滑輪調到最低位置（低於身體）。",
   "把上斜椅（調到 45 度）放在兩個滑輪中間，兩邊選好重量，雙手各握一個握把。",
   "握著握把躺上斜板，雙手伸直在臉部前方合起，這是起始姿勢。",
   "手肘保持微彎（避免二頭肌腱受壓），吸氣，雙手往兩側以大弧線打開，直到胸部有伸展感。小提醒：手臂角度全程固定，只有肩關節在動。",
   "吐氣，收緊胸肌把手臂沿原路線合回起始位置，停留 1 秒。小提醒：上下走同一條弧線。",
   "重複完成指定次數。"
  ],
  "move": "push"
 },
 {
  "id": "kneeling-cable-crunch-with-alternating-oblique-twists",
  "zh": "跪姿滑輪交替轉體捲腹",
  "en": "Kneeling Cable Crunch With Alternating Oblique Twists",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "用腹肌捲起，手固定在耳旁不拉",
  "steps": [
   "Connect a rope attachment to a high pulley cable and position a mat on the floor in front of it.",
   "Grab the rope with both hands and kneel approximately two feet back from the tower.",
   "Position the rope behind your head with your hands by your ears.",
   "Keep your hands in the same place, contract your abs and pull downward on the rope in a crunching movement until your elbows reach your knees.",
   "Pause briefly at the bottom and rise up in a slow and controlled manner until you reach the starting position.",
   "Repeat the same downward movement until you're halfway down, at which time you'll begin rotating one of your elbows to the opposite knee.",
   "Again, pause briefly at the bottom and rise up in a slow and controlled manner until you reach the starting position.",
   "Repeat the same movement as before, but alternate the other elbow to the opposite knee.",
   "Continue this series of movements to failure."
  ],
  "stepsZh": [
   "在高位滑輪接上繩索，前方地上鋪一張墊子。",
   "雙手握住繩索，跪在距離龍門架約 60 公分處。",
   "把繩索拉到頭後，雙手放在耳朵旁。",
   "雙手位置固定，收縮腹肌，以捲腹的方式往下拉，直到手肘碰到膝蓋。",
   "在底部稍停，再慢慢、有控制地起身回到起始位置。",
   "再做同樣的下拉動作，到一半時開始轉體，讓一側手肘往對側膝蓋靠。",
   "同樣在底部稍停，再慢慢、有控制地回到起始位置。",
   "重複動作，這次換另一側手肘往對側膝蓋靠。",
   "依序循環，做到力竭。"
  ],
  "move": "core"
 },
 {
  "id": "kneeling-cable-triceps-extension",
  "zh": "跪姿滑輪三頭伸展",
  "en": "Kneeling Cable Triceps Extension",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": false,
  "cue": "上臂貼近頭部，只動前臂",
  "steps": [
   "Place a bench sideways in front of a high pulley machine.",
   "Hold a straight bar attachment above your head with your hands about 6 inches apart with your palms facing down.",
   "Face away from the machine and kneel.",
   "Place your head and the back of your upper arms on the bench. Your elbows should be bent with the forearms pointing towards the high pulley. This will be your starting position.",
   "While keeping your upper arms close to your head at all times with the elbows in, press the bar out in a semicircular motion until the elbows are locked and your arms are parallel to the floor. Contract the triceps hard and keep this position for a second. Exhale as you perform this movement.",
   "Slowly return to the starting position as you breathe in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把臥推椅橫放在高位滑輪前方。",
   "雙手正握（掌心朝下）直桿舉在頭上，兩手間距約 15 公分。",
   "背對機器跪下。",
   "把頭和上臂後側靠在椅子上，手肘彎曲、前臂指向高位滑輪，這是起始姿勢。",
   "吐氣，上臂全程貼近頭部、手肘內收，把直桿以半圓弧線往前推，直到手肘伸直、手臂與地面平行。用力收緊三頭停 1 秒。",
   "吸氣，慢慢回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "kneeling-high-pulley-row",
  "zh": "跪姿高位繩索划船",
  "en": "Kneeling High Pulley Row",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "手肘向外打開，把繩索拉到上胸",
  "steps": [
   "Select the appropriate weight using a pulley that is above your head. Attach a rope to the cable and kneel a couple of feet away, holding the rope out in front of you with both arms extended. This will be your starting position.",
   "Initiate the movement by flexing the elbows and fully retracting your shoulders, pulling the rope toward your upper chest with your elbows out.",
   "After pausing briefly, slowly return to the starting position."
  ],
  "stepsZh": [
   "在高於頭部的滑輪選好重量並接上繩索。跪在離它約 60 公分處，雙手伸直握住繩索舉在前方，這是起始姿勢。",
   "彎曲手肘、肩胛骨完全後收，手肘向外打開，把繩索拉向上胸。",
   "稍停後，慢慢回到起始位置。"
  ],
  "move": "pull"
 },
 {
  "id": "kneeling-single-arm-high-pulley-row",
  "zh": "跪姿單手高位滑輪划船",
  "en": "Kneeling Single-Arm High Pulley Row",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "拉下時夾緊肩胛骨並轉動手腕",
  "steps": [
   "Attach a single handle to a high pulley and make your weight selection.",
   "Kneel in front of the cable tower, taking the cable with one hand with your arm extended. This will be your starting position.",
   "Starting with your palm facing forward, pull the weight down to your torso by flexing the elbow and retract the shoulder blade. As you do so, rotate the wrist so that at the completion of the movement, your palm is now facing you.",
   "After a brief pause, return to the starting position."
  ],
  "stepsZh": [
   "在高位滑輪接上單手握把，選好重量。",
   "面向龍門架跪下，單手握住握把、手臂伸直，這是起始姿勢。",
   "從掌心朝前開始，彎曲手肘把重量拉向身體，同時肩胛骨後收。拉的過程中轉動手腕，結束時掌心朝向自己。",
   "稍停後回到起始位置。"
  ],
  "move": "pull"
 },
 {
  "id": "leverage-deadlift",
  "zh": "槓桿式硬舉機",
  "en": "Leverage Deadlift",
  "equip": "machine",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "抬頭挺胸，用腳跟推地站起",
  "steps": [
   "Load the pins to an appropriate weight. Position yourself directly between the handles. Grasp the bottom handles with a comfortable grip, and then lower your hips as you take a breath. Look forward with your head and keep your chest up. This will be your starting position.",
   "Return the weight to the starting position."
  ],
  "stepsZh": [
   "在掛片處放上適當重量，站在兩個握把正中間。用舒適的方式握住下方握把，吸一口氣並把臀部往下坐。眼睛看前方、挺胸，這是起始姿勢。",
   "把重量放回起始位置。"
  ],
  "move": "pull"
 },
 {
  "id": "leverage-decline-chest-press",
  "zh": "下斜推胸機",
  "en": "Leverage Decline Chest Press",
  "equip": "machine",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "肩胛骨後收，回程不放到底",
  "steps": [
   "Load an appropriate weight onto the pins and adjust the seat for your height. The handles should be near the bottom of the pectorals at the beginning of the motion. Your chest and head should be up and your shoulder blades retracted. This will be your starting position.",
   "Press the handles forward by extending through the elbow.",
   "After a brief pause at the top, return the weight just above the start position, keeping tension on the muscles by not returning the weight to the stops until the set is complete."
  ],
  "stepsZh": [
   "放上適當重量，依身高調整座椅，起始時握把要在胸肌下緣附近。抬頭挺胸、肩胛骨後收，這是起始姿勢。",
   "伸直手肘，把握把往前推。",
   "在頂端稍停，再把重量放回到略高於起始點的位置。整組做完前不要把重量放到底，讓肌肉持續受力。"
  ],
  "move": "push"
 },
 {
  "id": "leverage-incline-chest-press",
  "zh": "上斜推胸機",
  "en": "Leverage Incline Chest Press",
  "equip": "machine",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "肩胛骨後收，回程不放到底",
  "steps": [
   "Load an appropriate weight onto the pins and adjust the seat for your height. The handles should be near the top of the pectorals at the beginning of the motion. Your chest and head should be up and your shoulder blades retracted. This will be your starting position.",
   "Press the handles forward by extending through the elbow.",
   "After a brief pause at the top, return the weight just above the start position, keeping tension on the muscles by not returning the weight to the stops until the set is complete."
  ],
  "stepsZh": [
   "放上適當重量，依身高調整座椅，起始時握把要在胸肌上緣附近。抬頭挺胸、肩胛骨後收，這是起始姿勢。",
   "伸直手肘，把握把往前推。",
   "在頂端稍停，再把重量放回到略高於起始點的位置。整組做完前不要把重量放到底，讓肌肉持續受力。"
  ],
  "move": "push"
 },
 {
  "id": "leverage-iso-row",
  "zh": "槓桿式划船機",
  "en": "Leverage Iso Row",
  "equip": "machine",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "拉時夾緊肩胛骨，回程不放到底",
  "steps": [
   "Load an appropriate weight onto the pins and adjust the seat height so that the handles are at chest level. Grasp the handles with either a neutral or pronated grip. This will be your starting position.",
   "Pull the handles towards your torso, retracting your shoulder blades as you flex the elbow.",
   "Pause at the bottom of the motion, and then slowly return the handles to the starting position. For multiple repetitions, avoid completely returning the weight to the stops to keep tension on the muscles being worked."
  ],
  "stepsZh": [
   "放上適當重量，調整座椅高度，讓握把與胸口同高。用對握或正握握住握把，這是起始姿勢。",
   "彎曲手肘把握把拉向身體，同時肩胛骨後收。",
   "在最後位置稍停，再慢慢把握把送回起始位置。連續做多次時，不要把重量完全放回底部，讓肌肉持續受力。"
  ],
  "move": "pull"
 },
 {
  "id": "leverage-shoulder-press",
  "zh": "肩推機",
  "en": "Leverage Shoulder Press",
  "equip": "machine",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "抬頭挺胸往上推，回程不放到底",
  "steps": [
   "Load an appropriate weight onto the pins and adjust the seat for your height. The handles should be near the top of the shoulders at the beginning of the motion. Your chest and head should be up and handles held with a pronated grip. This will be your starting position.",
   "Press the handles upward by extending through the elbow.",
   "After a brief pause at the top, return the weight to just above the start position, keeping tension on the muscles by not returning the weight to the stops until the set is complete."
  ],
  "stepsZh": [
   "放上適當重量，依身高調整座椅，起始時握把要在肩膀上方附近。抬頭挺胸，正握握把，這是起始姿勢。",
   "伸直手肘，把握把往上推。",
   "在頂端稍停，再把重量放回到略高於起始點的位置。整組做完前不要把重量放到底，讓肌肉持續受力。"
  ],
  "move": "push"
 },
 {
  "id": "leverage-shrug",
  "zh": "槓桿式聳肩機",
  "en": "Leverage Shrug",
  "equip": "machine",
  "primary": [
   "traps"
  ],
  "secondary": [
   "forearms"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "手臂打直，肩膀垂直上下聳動",
  "steps": [
   "Load the pins to an appropriate weight. Position yourself directly between the handles.",
   "Grasp the top handles with a comfortable grip, and then lower your hips as you take a breath. Look forward with your head and keep your chest up.",
   "Drive through the floor with your heels, extending your hips and knees as you rise to a standing position. Keep your arms straight throughout the movement, finishing with your shoulders back. This will be your starting position.",
   "Raise the weight by shrugging the shoulders towards your ears, moving straight up and down.",
   "Pause at the top of the motion, and then return the weight to the starting position."
  ],
  "stepsZh": [
   "在掛片處放上適當重量，站在兩個握把正中間。",
   "用舒適的方式握住上方握把，吸一口氣把臀部往下坐。眼睛看前方、挺胸。",
   "用腳跟推地，伸直髖部和膝蓋站起來。手臂全程打直，站直時肩膀往後收，這是起始姿勢。",
   "肩膀往耳朵方向聳起，垂直上下移動。",
   "在頂端稍停，再把重量放回起始位置。"
  ],
  "move": "pull"
 },
 {
  "id": "low-cable-crossover",
  "zh": "低位龍門架夾胸",
  "en": "Low Cable Crossover",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "手臂微彎，從下往上把手合到胸前",
  "steps": [
   "To move into the starting position, place the pulleys at the low position, select the resistance to be used and grasp a handle in each hand.",
   "Step forward, gaining tension in the pulleys. Your palms should be facing forward, hands below the waist, and your arms straight. This will be your starting position.",
   "With a slight bend in your arms, draw your hands upward and toward the midline of your body. Your hands should come together in front of your chest, palms facing up.",
   "Return your arms back to the starting position after a brief pause."
  ],
  "stepsZh": [
   "把兩側滑輪調到低位，選好阻力，雙手各握一個握把。",
   "往前跨一步讓滑輪產生張力。掌心朝前、雙手在腰部以下、手臂伸直，這是起始姿勢。",
   "手臂保持微彎，雙手往上並朝身體中線靠攏，在胸前合起，掌心朝上。",
   "稍停後，把手臂放回起始位置。"
  ],
  "move": "push"
 },
 {
  "id": "low-cable-triceps-extension",
  "zh": "仰臥低位繩索三頭伸展",
  "en": "Low Cable Triceps Extension",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂指向天花板固定，只動前臂",
  "steps": [
   "Select the desired weight and lay down face up on the bench of a seated row machine that has a rope attached to it. Your head should be pointing towards the attachment.",
   "Grab the outside of the rope ends with your palms facing each other (neutral grip).",
   "Position your elbows so that they are bent at a 90 degree angle and your upper arms are perpendicular (90 degree angle) to your torso. Tip: Keep the elbows in and make sure that the upper arms point to the ceiling while your forearms point towards the pulley above your head. This will be your starting position.",
   "As you breathe out, extend your lower arms until they are straight and vertical. The upper arms and elbows remain stationary throughout the movement. Only the forearms should move. Contract the triceps hard for a second.",
   "As you breathe in slowly return to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "選好重量，在接上繩索的坐姿划船機座椅上仰躺，頭朝滑輪方向。",
   "雙手對握（掌心相對）握住繩索兩端外側。",
   "手肘彎曲 90 度，上臂與身體垂直。小提醒：手肘內收，上臂指向天花板，前臂朝向頭頂上方的滑輪。這是起始姿勢。",
   "吐氣，把前臂伸直到垂直。上臂和手肘全程不動，只有前臂移動，用力收緊三頭 1 秒。",
   "吸氣，慢慢回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "low-pulley-row-to-neck",
  "zh": "坐姿繩索高拉至頸部",
  "en": "Low Pulley Row To Neck",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "biceps",
   "middle back",
   "traps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "上身固定，手肘抬高與地面平行",
  "steps": [
   "Sit on a low pulley row machine with a rope attachment.",
   "Grab the ends of the rope using a palms-down grip and sit with your back straight and your knees slightly bent. Tip: Keep your back almost completely vertical and your arms fully extended in front of you. This will be your starting position.",
   "While keeping your torso stationary, lift your elbows and start bending them as you pull the rope towards your neck while exhaling. Throughout the movement your upper arms should remain parallel to the floor. Tip: Continue this motion until your hands are almost next to your ears (the forearms will not be parallel to the floor at the end of the movement as they will be angled a bit upwards) and your elbows are out away from your sides.",
   "After holding for a second or so at the contracted position, come back slowly to the starting position as you inhale. Tip: Again, during no part of the movement should the torso move.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "坐在接上繩索的低位滑輪划船機上。",
   "雙手正握（掌心朝下）握住繩索兩端，背打直、膝蓋微彎。小提醒：背幾乎垂直，手臂完全伸直在前方。這是起始姿勢。",
   "上身不動，吐氣，抬起手肘並彎曲，把繩索拉向頸部，上臂全程與地面平行。小提醒：一直拉到雙手幾乎在耳朵旁（結束時前臂會微微朝上），手肘向外打開。",
   "在收縮位置停 1 秒左右，吸氣慢慢回到起始位置。小提醒：整個過程上身都不要動。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "lying-cable-curl",
  "zh": "仰臥滑輪彎舉",
  "en": "Lying Cable Curl",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": false,
  "cue": "上臂和手肘貼緊身體，只動前臂",
  "steps": [
   "Grab a straight bar or E-Z bar attachment that is attached to the low pulley with both hands, using an underhand (palms facing up) shoulder-width grip.",
   "Lie flat on your back on top of an exercise mat in front of the weight stack with your feet flat against the frame of the pulley machine and your legs straight.",
   "With your arms extended and your elbows close to your body slightly bend your arms. This will be your starting position.",
   "While keeping your upper arms stationary and the elbows close to your body, curl the bar up slowly toward your chest as you breathe out and you squeeze the biceps.",
   "After a second squeeze at the top of the movement, slowly return to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "雙手反握（掌心朝上）接在低位滑輪的直桿或 EZ 桿，握距與肩同寬。",
   "在配重片前方的墊子上仰躺，雙腳平貼滑輪機的框架、雙腿伸直。",
   "手臂伸直、手肘貼近身體，然後稍微彎曲手臂，這是起始姿勢。",
   "上臂不動、手肘貼近身體，吐氣，收緊二頭把桿子慢慢往胸口彎舉。",
   "在頂端夾緊 1 秒後，慢慢回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "lying-close-grip-bar-curl-on-high-pulley",
  "zh": "仰臥高位滑輪窄握彎舉",
  "en": "Lying Close-Grip Bar Curl On High Pulley",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂垂直固定，把桿子彎舉到下巴",
  "steps": [
   "Place a flat bench in front of a high pulley or lat pulldown machine.",
   "Hold the straight bar attachment using an underhand grip (palms up) that is about shoulder width.",
   "Lie on your back with your head over the end of the bench.",
   "Now extend your arms straight above your shoulders. Your torso and your arms should make a 90-degree angle and the elbows should be in. This will be your starting position.",
   "As you breathe out, curl the bar down in a semicircular motion until it touches your chin. Squeeze the biceps for a second at the top contracted position. Tip: As you execute this motion only the forearms should move. At no time should the upper arms be moving at all. They are to remain perpendicular throughout the movement.",
   "Return to starting position slowly.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把平板臥推椅放在高位滑輪或滑輪下拉機前方。",
   "雙手反握（掌心朝上）直桿，握距約與肩同寬。",
   "仰躺在椅上，頭部超出椅子末端。",
   "手臂伸直舉在肩膀正上方，與身體呈 90 度，手肘內收，這是起始姿勢。",
   "吐氣，以半圓弧線把直桿往下彎舉到碰到下巴，在頂端夾緊二頭 1 秒。小提醒：只有前臂移動，上臂全程保持垂直不動。",
   "慢慢回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "lying-machine-squat",
  "zh": "仰躺式深蹲機",
  "en": "Lying Machine Squat",
  "equip": "machine",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "用前腳掌推起，下蹲到大腿平行即可",
  "steps": [
   "Adjust the leg machine to a height that will allow you to get inside it with your knees bent and the thighs slightly below parallel.",
   "Once you select the weight, position yourself inside the machine face up with the knees bent and thighs slightly below parallel to the platform. Make sure that the knees do not go past the toes. The angle created between the hamstrings and the calves should be one that is slightly less than 90 degrees (since your starting position requires you to start slightly below parallel). Your back and your head should be resting on the machine while your shoulders are pressed under the shoulder pads.",
   "Place your hands by the handles and position your feet slightly pointing out at a shoulder width position. This will be your starting position.",
   "While pressing with the balls of the feet as you breathe out, make your whole body erect as you squeeze the quads. Hold the contracted position for a second. Tip: Since you are starting below parallel, you can opt to use your hands to help you up by pressing on your thighs only on the first repetition.",
   "Slowly squat down as you inhale but instead of going all the way down to the starting position, just stop once your thighs are parallel to the platform. The angle between your hamstrings and calves should be a 90-degree angle.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "調整機器高度，讓你進去時膝蓋彎曲、大腿略低於平行。",
   "選好重量後，臉朝上躺進機器，膝蓋彎曲、大腿略低於與踏板平行。膝蓋不要超過腳尖，大腿後側與小腿的夾角略小於 90 度。背和頭靠在機器上，肩膀頂在肩墊下方。",
   "雙手放在握把旁，雙腳與肩同寬、腳尖微朝外，這是起始姿勢。",
   "吐氣，用前腳掌推，讓全身伸直並收緊股四頭肌，停留 1 秒。小提醒：因為從低於平行開始，第一下可以用手壓大腿幫忙推起。",
   "吸氣慢慢蹲下，但不用回到最低的起始位置，大腿與踏板平行時就停，此時大腿後側與小腿呈 90 度。",
   "重複完成建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "machine-bicep-curl",
  "zh": "二頭彎舉機",
  "en": "Machine Bicep Curl",
  "equip": "machine",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂貼墊，回程不放到底",
  "steps": [
   "Adjust the seat to the appropriate height and make your weight selection. Place your upper arms against the pads and grasp the handles. This will be your starting position.",
   "Perform the movement by flexing the elbow, pulling your lower arm towards your upper arm.",
   "Pause at the top of the movement, and then slowly return the weight to the starting position.",
   "Avoid returning the weight all the way to the stops until the set is complete to keep tension on the muscles being worked."
  ],
  "stepsZh": [
   "調整座椅到合適高度並選好重量。上臂貼在墊子上，握住握把，這是起始姿勢。",
   "彎曲手肘，把前臂往上臂方向拉。",
   "在頂端稍停，再慢慢把重量放回起始位置。",
   "整組做完前不要把重量完全放到底，讓肌肉持續受力。"
  ],
  "move": "pull"
 },
 {
  "id": "machine-preacher-curls",
  "zh": "牧師椅彎舉機",
  "en": "Machine Preacher Curls",
  "equip": "machine",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂全程貼墊，只動前臂",
  "steps": [
   "Sit down on the Preacher Curl Machine and select the weight.",
   "Place the back of your upper arms (your triceps) on the preacher pad provided and grab the handles using an underhand grip (palms facing up). Tip: Make sure that when you place the arms on the pad you keep the elbows in. This will be your starting position.",
   "Now lift the handles as you exhale and you contract the biceps. At the top of the position make sure that you hold the contraction for a second. Tip: Only the forearms should move. The upper arms should remain stationary and on the pad at all times.",
   "Lower the handles slowly back to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "坐上牧師椅彎舉機，選好重量。",
   "上臂後側（三頭）貼在牧師墊上，反握（掌心朝上）握住握把。小提醒：手肘放在墊子上時要內收。這是起始姿勢。",
   "吐氣，收縮二頭把握把舉起，在頂端停留 1 秒。小提醒：只有前臂移動，上臂全程貼在墊子上不動。",
   "吸氣，把握把慢慢放回起始位置。",
   "重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "machine-triceps-extension",
  "zh": "三頭伸展機",
  "en": "Machine Triceps Extension",
  "equip": "machine",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂貼墊，回程不放到底",
  "steps": [
   "Adjust the seat to the appropriate height and make your weight selection. Place your upper arms against the pads and grasp the handles. This will be your starting position.",
   "Perform the movement by extending the elbow, pulling your lower arm away from your upper arm.",
   "Pause at the completion of the movement, and then slowly return the weight to the starting position.",
   "Avoid returning the weight all the way to the stops until the set is complete to keep tension on the muscles being worked."
  ],
  "stepsZh": [
   "調整座椅到合適高度並選好重量。上臂貼在墊子上，握住握把，這是起始姿勢。",
   "伸直手肘，把前臂推離上臂。",
   "在動作末端稍停，再慢慢把重量放回起始位置。",
   "整組做完前不要把重量完全放到底，讓肌肉持續受力。"
  ],
  "move": "push"
 },
 {
  "id": "narrow-stance-hack-squats",
  "zh": "窄站距哈克深蹲",
  "en": "Narrow Stance Hack Squats",
  "equip": "machine",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "背貼靠墊，主要用腳跟推起",
  "steps": [
   "Place the back of your torso against the back pad of the machine and hook your shoulders under the shoulder pads provided.",
   "Position your legs in the platform using a less than shoulder width narrow stance with the toes slightly pointed out. Your feet should be around 3 inches or less apart. Tip: Keep your head up at all times and also maintain the back on the pad at all times.",
   "Place your arms on the side handles of the machine and disengage the safety bars (which on most designs is done by moving the side handles from a facing front position to a diagonal position).",
   "Now straighten your legs without locking the knees. This will be your starting position.",
   "Begin to slowly lower the unit by bending the knees as you maintain a straight posture with the head up (back on the pad at all times). Continue down until the angle between the upper leg and the calves becomes slightly less than 90-degrees (which is the point in which the upper legs are below parallel to the floor). Inhale as you perform this portion of the movement.",
   "Begin to raise the unit as you exhale by pushing the floor with mainly with the heels of your feet as you straighten the legs again and go back to the starting position.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "背部貼著機器的靠墊，肩膀卡在肩墊下方。",
   "雙腳以窄於肩寬的站距踩在踏板上，腳尖微朝外，兩腳間距約 7–8 公分以內。小提醒：全程抬頭，背也要一直貼著靠墊。",
   "雙手握住機器兩側握把，解開安全桿（多數機型是把側邊握把從朝前轉到斜向）。",
   "雙腿伸直但膝蓋不要鎖死，這是起始姿勢。",
   "吸氣，彎曲膝蓋慢慢往下，保持抬頭、背貼靠墊。一直蹲到大腿與小腿夾角略小於 90 度（大腿略低於與地面平行）。",
   "吐氣，主要用腳跟推踏板，把腿伸直回到起始位置。",
   "重複完成建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "narrow-stance-leg-press",
  "zh": "窄站距腿推",
  "en": "Narrow Stance Leg Press",
  "equip": "machine",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "膝蓋不鎖死，主要用腳跟推",
  "steps": [
   "Using a leg press machine, sit down on the machine and place your legs on the platform directly in front of you at a less-than-shoulder-width narrow stance with the toes slightly pointed out. Your feet should be around 3 inches or less apart. Tip: Keep your head up at all times and also maintain the back on the pad at all times.",
   "Lower the safety bars holding the weighted platform in place and press the platform all the way up until your legs are fully extended in front of you. Tip: Make sure that you do not lock your knees. Your torso and the legs should make a perfect 90-degree angle. This will be your starting position.",
   "As you inhale, slowly lower the platform until your upper and lower legs make a 90-degree angle.",
   "Pushing mainly with the heels of your feet and using the quadriceps go back to the starting position as you exhale.",
   "Repeat for the recommended amount of repetitions and ensure to lock the safety pins properly once you are done. You do not want that platform falling on you fully loaded."
  ],
  "stepsZh": [
   "坐上腿推機，雙腳以窄於肩寬的站距踩在正前方踏板上，腳尖微朝外，兩腳間距約 7–8 公分以內。小提醒：全程抬頭，背一直貼著靠墊。",
   "放下固定踏板的安全桿，把踏板推到雙腿伸直。小提醒：膝蓋不要鎖死。上身和雙腿約呈 90 度，這是起始姿勢。",
   "吸氣，慢慢放下踏板，直到大腿與小腿呈 90 度。",
   "吐氣，主要用腳跟、靠股四頭肌出力推回起始位置。",
   "完成建議次數後，記得把安全桿確實鎖好。注意：千萬別讓滿載的踏板壓下來。"
  ],
  "move": "push"
 },
 {
  "id": "one-arm-high-pulley-cable-side-bends",
  "zh": "單手高位滑輪側彎",
  "en": "One-Arm High-Pulley Cable Side Bends",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手臂固定，用側腹把重量往下拉",
  "steps": [
   "Connect a standard handle to a tower. Move cable to highest pulley position.",
   "Stand with side to cable. With one hand, reach up and grab handle with underhand grip.",
   "Pull down cable until elbow touches your side and the handle is by your shoulder.",
   "Position feet hip-width apart. Place free hand on hip to help gauge pivot point.",
   "Keep arm in static position. Contract oblique to bring the weight down in a side crunch.",
   "Once you reach maximum contraction, slowly release the weight to the starting position. The weight stack should never be unloaded in a resting position. The aim is constant tension during the set.",
   "Repeat to failure.",
   "Then, reposition and repeat the same series of movements on the opposite side."
  ],
  "stepsZh": [
   "在龍門架接上單手握把，把滑輪調到最高位置。",
   "側身對著滑輪站，單手往上反握握把。",
   "把握把往下拉，直到手肘碰到身側、握把在肩膀旁。",
   "雙腳與髖同寬，另一隻手扶在髖部，幫助感受轉折點。",
   "手臂保持不動，收縮側腹，以側向捲腹把重量往下帶。",
   "收縮到最緊後，慢慢讓重量回到起始位置。整組過程中配重片不要完全放回去休息，要讓肌肉持續受力。",
   "做到力竭。",
   "接著換邊，另一側重複同樣的動作。"
  ],
  "move": "core"
 },
 {
  "id": "one-legged-cable-kickback",
  "zh": "單腳滑輪後踢",
  "en": "One-Legged Cable Kickback",
  "equip": "cable",
  "primary": [
   "glutes"
  ],
  "secondary": [
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": false,
  "cue": "核心收緊，用臀部把腿往後踢",
  "steps": [
   "Hook a leather ankle cuff to a low cable pulley and then attach the cuff to your ankle.",
   "Face the weight stack from a distance of about two feet, grasping the steel frame for support.",
   "While keeping your knees and hips bent slightly and your abs tight, contract your glutes to slowly \"kick\" the working leg back in a semicircular arc as high as it will comfortably go as you breathe out. Tip: At full extension, squeeze your glutes for a second in order to achieve a peak contraction.",
   "Now slowly bring your working leg forward, resisting the pull of the cable until you reach the starting position.",
   "Repeat for the recommended amount of repetitions.",
   "Switch legs and repeat the movement for the other side."
  ],
  "stepsZh": [
   "把腳踝綁帶扣在低位滑輪上，再套到腳踝。",
   "面向配重片，站在約 60 公分遠處，雙手扶著鐵架支撐。",
   "膝蓋和髖部微彎、腹部收緊，吐氣，收縮臀部把工作腿以半圓弧線慢慢往後「踢」，踢到舒適的最高點。小提醒：腿伸到最遠時，夾緊臀部 1 秒。",
   "抵抗滑輪的拉力，慢慢把工作腿帶回前方的起始位置。",
   "重複完成建議次數。",
   "換腳，另一側重複同樣動作。"
  ],
  "move": "push"
 },
 {
  "id": "one-arm-lat-pulldown",
  "zh": "單手滑輪下拉",
  "en": "One Arm Lat Pulldown",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "把手肘往身側夾，回程不放到底",
  "steps": [
   "Select an appropriate weight and adjust the knee pad to help keep you down. Grasp the handle with a pronated grip. This will be your starting position.",
   "Pull the handle down, squeezing your elbow to your side as you flex the elbow.",
   "Pause at the bottom of the motion, and then slowly return the handle to the starting position.",
   "For multiple repetitions, avoid completely returning the weight to keep tension on the muscles being worked."
  ],
  "stepsZh": [
   "選好適當重量，調整膝墊把身體固定住，正握握住握把，這是起始姿勢。",
   "彎曲手肘把握把往下拉，手肘往身側夾緊。",
   "在底部稍停，再慢慢把握把送回起始位置。",
   "連續做多次時，不要讓重量完全回到底，讓肌肉持續受力。"
  ],
  "move": "pull"
 },
 {
  "id": "overhead-cable-curl",
  "zh": "高位滑輪雙手彎舉",
  "en": "Overhead Cable Curl",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": false,
  "cue": "只動前臂，身體其他部位保持不動",
  "steps": [
   "To begin, set a weight that is comfortable on each side of the pulley machine. Note: Make sure that the amount of weight selected is the same on each side.",
   "Now adjust the height of the pulleys on each side and make sure that they are positioned at a height higher than that of your shoulders.",
   "Stand in the middle of both sides and use an underhand grip (palms facing towards the ceiling) to grab each handle. Your arms should be fully extended and parallel to the floor with your feet positioned shoulder width apart from each other. Your body should be evenly aligned the handles. This is the starting position.",
   "While exhaling, slowly squeeze the biceps on each side until your forearms and biceps touch.",
   "While inhaling, move your forearms back to the starting position. Note: Your entire body is stationary during this exercise except for the forearms.",
   "Repeat for the recommended amount of repetitions prescribed in your program."
  ],
  "stepsZh": [
   "先在滑輪機兩側設定舒適的重量。注意：兩邊的重量要一樣。",
   "調整兩側滑輪的高度，要高於肩膀。",
   "站在兩側滑輪正中間，雙手反握（掌心朝上）各握一個握把。手臂完全伸直、與地面平行，雙腳與肩同寬，身體與兩邊握把對齊，這是起始姿勢。",
   "吐氣，兩邊同時收緊二頭慢慢彎舉，直到前臂碰到二頭。",
   "吸氣，把前臂放回起始位置。注意：整個動作中只有前臂移動，身體其他部位保持不動。",
   "依你的課表重複完成建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "pallof-press",
  "zh": "Pallof 抗旋轉推",
  "en": "Pallof Press",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [
   "chest",
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "核心收緊，別讓身體被滑輪拉轉",
  "steps": [
   "Connect a standard handle to a tower, and—if possible—position the cable to shoulder height. If not, a low pulley will suffice.",
   "With your side to the cable, grab the handle with both hands and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable.",
   "With your feet positioned hip-width apart and knees slightly bent, hold the cable to the middle of your chest. This will be your starting position.",
   "Press the cable away from your chest, fully extending both arms. You core should be tight and engaged.",
   "Hold the repetition for several seconds before returning to the starting position.",
   "At the conclusion of the set, repeat facing the other direction."
  ],
  "stepsZh": [
   "在龍門架接上單手握把，盡量把滑輪調到與肩同高；不行的話用低位滑輪也可以。",
   "側身對著滑輪，雙手握住握把往外走，離滑輪約一個手臂長，讓滑輪保持張力。",
   "雙腳與髖同寬、膝蓋微彎，把握把拉到胸口正中央，這是起始姿勢。",
   "把握把從胸口往前推，雙手完全伸直，核心保持收緊出力。",
   "維持這個姿勢數秒，再回到起始位置。",
   "這組做完後，轉向另一側重複。"
  ],
  "move": "core"
 },
 {
  "id": "pallof-press-with-rotation",
  "zh": "Pallof 推轉體",
  "en": "Pallof Press With Rotation",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [
   "chest",
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "髖部朝前固定，只轉上半身",
  "steps": [
   "Connect a standard handle to a tower, and position the cable to shoulder height.",
   "With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable. Align outstretched arm with cable.",
   "With your feet positioned hip-width apart, pull the cable into your chest and grab the handle with your other hand. Both hands should be on the handle at this time.",
   "Facing forward, press the cable away from your chest. You core should be tight and engaged.",
   "Keeping your hips straight, twist your torso away from the pulley until you get a full quarter rotation.",
   "Maintain your rigid stance and straight arms. Return to the neutral position in a slow and controlled manner. Your arms should be extended in front of you.",
   "With the side tension still engaging your core, bring your hands to your chest and immediately press outward to a fully extended position. This constitutes one rep.",
   "Repeat to failure.",
   "Then, reposition and repeat the same series of movements on the opposite side."
  ],
  "stepsZh": [
   "在龍門架接上單手握把，把滑輪調到與肩同高。",
   "側身對著滑輪，單手握住握把往外走，離滑輪約一個手臂長，讓滑輪保持張力。伸直的手臂與纜繩對齊。",
   "雙腳與髖同寬，把握把拉到胸前，另一隻手也握上，此時雙手都握著握把。",
   "面向前方，把握把從胸口往前推，核心收緊出力。",
   "髖部保持朝前，上半身往遠離滑輪的方向轉，轉滿 90 度。",
   "維持穩定的站姿、手臂打直，慢慢有控制地轉回正前方，雙手伸直在身體前方。",
   "在側向拉力持續作用於核心的狀態下，把雙手收回胸前，再立刻往前推到完全伸直，這樣算 1 次。",
   "做到力竭。",
   "接著換邊，另一側重複同樣的動作。"
  ],
  "move": "core"
 },
 {
  "id": "pull-through",
  "zh": "滑輪臀部後拉",
  "en": "Pull Through",
  "equip": "cable",
  "primary": [
   "glutes"
  ],
  "secondary": [
   "hamstrings",
   "lower back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "動作全靠髖部發力，不要用肩膀拉",
  "steps": [
   "Begin standing a few feet in front of a low pulley with a rope or handle attached. Face away from the machine, straddling the cable, with your feet set wide apart.",
   "Begin the movement by reaching through your legs as far as possible, bending at the hips. Keep your knees slightly bent. Keeping your arms straight, extend through the hip to stand straight up. Avoid pulling upward through the shoulders; all of the motion should originate through the hips."
  ],
  "stepsZh": [
   "在低位滑輪裝上繩索或握把，背對機器站在前方幾步遠，雙腳大開跨在繩索兩側。",
   "髖部往後折，雙手從兩腿之間盡量往後伸，膝蓋微彎。手臂保持打直，靠髖部往前推把身體站直。不要用肩膀往上拉，所有動作都要從髖部發力。"
  ],
  "move": "pull"
 },
 {
  "id": "reverse-cable-curl",
  "zh": "滑輪反手彎舉",
  "en": "Reverse Cable Curl",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [
   "forearms"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "上臂固定不動，只有前臂移動",
  "steps": [
   "Stand up with your torso upright while holding a bar attachment that is attached to a low pulley using a pronated (palms down) and shoulder width grip. Make sure also that you keep the elbows close to the torso. This will be your starting position.",
   "While holding the upper arms stationary, curl the weights while contracting the biceps as you breathe out. Only the forearms should move. Continue the movement until your biceps are fully contracted and the bar is at shoulder level. Hold the contracted position for a second as you squeeze the muscle.",
   "Slowly begin to bring the bar back to starting position as your breathe in.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "身體站直，用正手（掌心朝下）、與肩同寬的握法握住接在低位滑輪的直桿，手肘貼近身體。這是起始姿勢。",
   "上臂固定，吐氣時收縮二頭把直桿往上彎舉，只有前臂移動。舉到二頭完全收縮、直桿到肩膀高度，停留 1 秒並用力擠壓。",
   "吸氣，慢慢把直桿放回起始位置。",
   "重複到建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "reverse-grip-triceps-pushdown",
  "zh": "反手三頭下壓",
  "en": "Reverse Grip Triceps Pushdown",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘夾緊身體兩側，全程不要移動",
  "steps": [
   "Start by setting a bar attachment (straight or e-z) on a high pulley machine.",
   "Facing the bar attachment, grab it with the palms facing up (supinated grip) at shoulder width. Lower the bar by using your lats until your arms are fully extended by your sides. Tip: Elbows should be in by your sides and your feet should be shoulder width apart from each other. This is the starting position.",
   "Slowly elevate the bar attachment up as you inhale so it is aligned with your chest. Only the forearms should move and the elbows/upper arms should be stationary by your side at all times.",
   "Then begin to lower the cable bar back down to the original staring position while exhaling and contracting the triceps hard.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "在高位滑輪裝上直桿或 EZ 彎桿。",
   "面向握把，用反手（掌心朝上）、與肩同寬握住，利用背闊肌把直桿往下拉，直到手臂在身體兩側完全打直。小提醒：手肘貼在身體兩側，雙腳與肩同寬。這是起始姿勢。",
   "吸氣，慢慢讓直桿往上升到大約胸口高度。只有前臂移動，手肘和上臂全程固定在身體兩側。",
   "吐氣，用力收縮三頭，把直桿往下壓回起始位置。",
   "重複到建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "reverse-hyperextension",
  "zh": "反向背伸展",
  "en": "Reverse Hyperextension",
  "equip": "machine",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "calves",
   "glutes"
  ],
  "level": "intermediate",
  "compound": false,
  "cue": "後踢時不要過度伸展髖部，留一點餘裕",
  "steps": [
   "Place your feet between the pads after loading an appropriate weight. Lay on the top pad, allowing your hips to hang off the back, while grasping the handles to hold your position.",
   "To begin the movement, flex the hips, pulling the legs forward.",
   "Reverse the motion by extending the hips, kicking the leg back. It is very important not to over-extend the hip on this movement, stopping short of your full range of motion.",
   "Return by again flexing the hip, pulling the carriage forward as far as you can.",
   "Repeat for the desired number of repetitions."
  ],
  "stepsZh": [
   "掛上適當重量後，雙腳放在軟墊之間，趴在上方軟墊上，讓髖部懸空在墊子後方，雙手抓住握把固定身體。",
   "屈髖，把雙腿往前帶，開始動作。",
   "接著伸展髖部，把腿往後踢。注意：這個動作千萬不要過度伸展髖部，在最大活動範圍之前就要停住。",
   "再次屈髖，把擺臂盡量往前帶回。",
   "重複到需要的次數。"
  ],
  "move": "pull"
 },
 {
  "id": "rope-crunch",
  "zh": "跪姿繩索捲腹",
  "en": "Rope Crunch",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "用腹肌捲起脊椎，不要只用手臂拉",
  "steps": [
   "Kneel 1-2 feet in front of a cable system with a rope attached.",
   "After selecting an appropriate weight, grasp the rope with both hands reaching overhead. Your torso should be upright in the starting position.",
   "To begin, flex at the spine, attempting to bring your rib cage to your legs as you pull the cable down.",
   "Pause at the bottom of the motion, and then slowly return to the starting position.",
   "These can be done with twists or to the side to hit the obliques."
  ],
  "stepsZh": [
   "在裝好繩索的龍門架前方約 30～60 公分處跪下。",
   "選好適當重量後，雙手往上抓住繩索，起始時上半身保持直立。",
   "彎曲脊椎，把肋骨往大腿方向捲，同時把繩索往下拉。",
   "在最低點稍微停頓，再慢慢回到起始姿勢。",
   "變化式：可以加上轉體或往側邊捲，加強練到腹斜肌。"
  ],
  "move": "core"
 },
 {
  "id": "rope-straight-arm-pulldown",
  "zh": "繩索直臂下拉",
  "en": "Rope Straight-Arm Pulldown",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手臂全程打直，用背闊肌把繩索往下拉",
  "steps": [
   "Attach a rope to a high pulley and make your weight selection. Stand a couple feet back from the pulley with your feet staggered and take the rope with both hands. Lean forward from the hip, keeping your back straight, with your arms extended up in front of you. This will be your starting position.",
   "Keeping your arms straight, extend the shoulder to pull the rope down to your thighs.",
   "Pause at the bottom of the motion, squeezing your lats.",
   "Return to the starting position without allowing the weight to fully rest on the stack."
  ],
  "stepsZh": [
   "在高位滑輪裝上繩索並選好重量。站在滑輪後方約 60 公分處，雙腳前後站，雙手握住繩索。從髖部往前傾，背部打直，手臂往前上方伸直。這是起始姿勢。",
   "手臂保持打直，從肩膀發力把繩索往下拉到大腿位置。",
   "在最低點停頓，用力夾緊背闊肌。",
   "回到起始姿勢，過程中不要讓配重片完全放回去休息。"
  ],
  "move": "pull"
 },
 {
  "id": "seated-cable-shoulder-press",
  "zh": "坐姿滑輪肩推",
  "en": "Seated Cable Shoulder Press",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "全程保持繩索有張力，不要放鬆",
  "steps": [
   "Adjust the weight to an appropriate amount and be seated, grasping the handles. Your upper arms should be about 90 degrees to the body, with your head and chest up. The elbows should also be bent to about 90 degrees. This will be your starting position.",
   "Begin by extending through the elbow, pressing the handles together above your head.",
   "After pausing at the top, return the handles to the starting position. Ensure that you maintain tension on the cables.",
   "You can also execute this movement with your back off the pad and alternate hands."
  ],
  "stepsZh": [
   "調好適當重量後坐下，雙手握住握把。上臂與身體約呈 90 度，抬頭挺胸，手肘也彎曲約 90 度。這是起始姿勢。",
   "伸直手肘，把握把往頭頂上方推並靠攏。",
   "在頂端稍微停頓，再把握把放回起始位置，過程中保持繩索有張力。",
   "變化式：也可以背部離開靠墊，或左右手交替推。"
  ],
  "move": "push"
 },
 {
  "id": "seated-one-arm-cable-pulley-rows",
  "zh": "單手坐姿滑輪划船",
  "en": "Seated One-arm Cable Pulley Rows",
  "equip": "cable",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "biceps",
   "lats",
   "traps"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "拉的時候轉動手腕，並用力夾緊背部",
  "steps": [
   "To get into the starting position, first sit down on the machine and place your feet on the front platform or crossbar provided making sure that your knees are slightly bent and not locked.",
   "Lean over as you keep the natural alignment of your back and grab the single handle attachment with your left arm using a palms-down grip.",
   "With your arm extended pull back until your torso is at a 90-degree angle from your legs. Your back should be slightly arched and your chest should be sticking out. You should be feeling a nice stretch on your lat as you hold the bar in front of you. The right arm can be kept by the waist. This is the starting position of the exercise.",
   "Keeping the torso stationary, pull the handles back towards your torso while keeping the arms close to it as you rotate the wrist, so that by the time your hand is by your abdominals it is in a neutral position (palms facing the torso). Breathe out as you perform that movement. At that point you should be squeezing your back muscles hard.",
   "Hold that contraction for a second and slowly go back to the original position while breathing in. Tip: Remember to rotate the wrist as you go back to the starting position so that the palms are facing down again.",
   "Repeat for the recommended amount of repetitions and then perform the same movement with the right hand."
  ],
  "stepsZh": [
   "坐上機器，雙腳踩在前方踏板或橫桿上，膝蓋微彎不要鎖死。",
   "保持背部自然曲線往前傾，用左手正手（掌心朝下）握住單手握把。",
   "手臂伸直往後拉，直到上半身與腿呈 90 度。背部微微拱起、挺胸，握把在前方時要感覺到背闊肌有拉伸感。右手可以放在腰側。這是起始姿勢。",
   "上半身保持不動，手臂貼近身體把握把往後拉向軀幹，同時轉動手腕，讓手拉到腹部旁時變成掌心朝向身體。吐氣完成動作，這時要用力夾緊背部肌肉。",
   "維持收縮 1 秒，吸氣慢慢回到起始位置。小提醒：回去時記得把手腕轉回來，讓掌心再次朝下。",
   "完成建議次數後，換右手做同樣的動作。"
  ],
  "move": "pull"
 },
 {
  "id": "seated-two-arm-palms-up-low-pulley-wrist-curl",
  "zh": "坐姿滑輪正握腕彎舉",
  "en": "Seated Two-Arm Palms-Up Low-Pulley Wrist Curl",
  "equip": "cable",
  "primary": [
   "forearms"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "只有手腕動，前臂固定在大腿上",
  "steps": [
   "Put a bench in front of a low pulley machine that has a barbell or EZ Curl attachment on it.",
   "Move the bench far enough away so that when you bring the handle to the top of your thighs tension is created on the cable due to the weight stack being moved up.",
   "Now hold the handle with both hands, palms up, using a shoulder-width grip.",
   "Step back and sit on the bench with your feet about shoulder width apart, firmly on the floor.",
   "Lean forward and place the forearms on your thighs with the back of your wrists over your knees. This will be your starting position.",
   "Lower the bar as far as possible, while inhaling and keeping a tight grip.",
   "Now curl the bar up as high as possible while contracting the forearms. Tip: Only the wrist should move; not the forearms.",
   "After a second contraction at the top go back to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "在裝有直桿或 EZ 彎桿的低位滑輪前放一張臥推椅。",
   "把臥推椅移得夠遠，讓你把握把拿到大腿上方時，配重片被拉起、繩索有張力。",
   "雙手掌心朝上，以與肩同寬的握距握住握把。",
   "往後退並坐在臥推椅上，雙腳約與肩同寬，穩穩踩在地上。",
   "身體前傾，前臂放在大腿上，手腕背面超出膝蓋。這是起始姿勢。",
   "吸氣，握緊握把，讓直桿盡量往下放。",
   "接著收縮前臂，把直桿盡量往上捲起。小提醒：只有手腕動，前臂不要動。",
   "在頂端收縮 1 秒後，吸氣回到起始姿勢。",
   "重複到建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "shotgun-row",
  "zh": "單手旋轉划船",
  "en": "Shotgun Row",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "拉的同時把掌心轉向上",
  "steps": [
   "Attach a single handle to a low cable.",
   "After selecting the correct weight, stand a couple feet back with a wide-split stance. Your arm should be extended and your shoulder forward. This will be your starting position.",
   "Perform the movement by retracting the shoulder and flexing the elbow. As you pull, supinate the wrist, turning the palm upward as you go.",
   "After a brief pause, return to the starting position."
  ],
  "stepsZh": [
   "在低位滑輪裝上單手握把。",
   "選好重量後，往後退約 60 公分，雙腳前後大跨步站。手臂伸直、肩膀往前延伸。這是起始姿勢。",
   "把肩膀往後收、彎曲手肘往後拉。拉的同時轉動手腕，讓掌心逐漸朝上。",
   "稍微停頓後，回到起始姿勢。"
  ],
  "move": "pull"
 },
 {
  "id": "single-arm-cable-crossover",
  "zh": "龍門架單手夾胸",
  "en": "Single-Arm Cable Crossover",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "手肘保持微彎，用胸肌把手臂帶回中線",
  "steps": [
   "Begin by moving the pulleys to the high position, select the resistance to be used, and take a handle in each hand.",
   "Step forward in front of both pulleys with your arms extended in front of you, bringing your hands together. Your head and chest should be up as you lean forward, while your feet should be staggered. This will be your starting position.",
   "Keeping your left arm in place, allow your right arm to extend out to the side, maintaining a slight bend at the elbow. The right arm should be perpendicular to the body at approximately shoulder level.",
   "Return your arm back to the starting position by pulling your hand back to the midline of the body.",
   "Hold for a second at the starting position and repeat the movement on the opposite side. Continue alternating back and forth for the prescribed number of repetitions."
  ],
  "stepsZh": [
   "把兩側滑輪調到高位，選好重量，兩手各握一個握把。",
   "往前站到兩個滑輪之間，手臂往前伸直、雙手靠攏。抬頭挺胸、身體前傾，雙腳前後站。這是起始姿勢。",
   "左手保持不動，右手往側邊打開，手肘維持微彎。右手臂打開到約肩膀高度、與身體垂直。",
   "把手拉回身體中線，回到起始位置。",
   "在起始位置停留 1 秒，換另一側重複。左右交替做到指定次數。"
  ],
  "move": "push"
 },
 {
  "id": "single-leg-leg-extension",
  "zh": "單腳腿部伸展",
  "en": "Single-Leg Leg Extension",
  "equip": "machine",
  "primary": [
   "quadriceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "伸直時停頓，下放時不要讓配重停下",
  "steps": [
   "Seat yourself in the machine and adjust it so that you are positioned properly. The pad should be against the lower part of the shin but not in contact with the ankle. Adjust the seat so that the pivot point is in line with your knee. Select a weight appropriate for your abilities.",
   "Maintaining good posture, fully extend one leg, pausing at the top of the motion.",
   "Return to the starting position without letting the weight stop, keeping tension on the muscle.",
   "Repeat for the desired number of repetitions."
  ],
  "stepsZh": [
   "坐上機器並調整到合適位置：軟墊抵在小腿下段、不要碰到腳踝；調整座椅讓機器轉軸對齊膝蓋。選擇適合自己的重量。",
   "保持良好姿勢，把一隻腳完全伸直，在頂端稍微停頓。",
   "回到起始位置時不要讓配重停下，保持肌肉持續出力。",
   "重複到需要的次數。"
  ],
  "move": "push"
 },
 {
  "id": "smith-machine-behind-the-back-shrug",
  "zh": "史密斯背後聳肩",
  "en": "Smith Machine Behind the Back Shrug",
  "equip": "smith",
  "primary": [
   "traps"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "肩膀直直往上聳，手臂不要彎",
  "steps": [
   "With the bar at thigh level, load an appropriate weight.",
   "Stand with the bar behind you, taking a shoulder-width, pronated grip on the bar and unhook the weight. You should be standing up straight with your head and chest up and your arms extended. This will be your starting position.",
   "Initiate the movement by shrugging your shoulders straight up. Do not flex the arms or wrist during the movement.",
   "After a brief pause return the weight to the starting position.",
   "Repeat for the desired number of repetitions before engaging the hooks to rack the weight."
  ],
  "stepsZh": [
   "把槓鈴設在大腿高度，掛上適當重量。",
   "背對槓鈴站好，雙手在身後以正手、與肩同寬握住槓鈴並解開掛鉤。身體站直，抬頭挺胸，手臂伸直。這是起始姿勢。",
   "把肩膀直直往上聳起。過程中手臂和手腕都不要彎。",
   "稍微停頓後，把重量放回起始位置。",
   "做完需要的次數後，把槓鈴掛回掛鉤上。"
  ],
  "move": "pull"
 },
 {
  "id": "smith-machine-bent-over-row",
  "zh": "史密斯俯身划船",
  "en": "Smith Machine Bent Over Row",
  "equip": "smith",
  "primary": [
   "middle back"
  ],
  "secondary": [
   "biceps",
   "lats",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "背部打直，手肘貼近身體往上拉",
  "steps": [
   "Set the barbell attached to the smith machine to a height that is about 2 inches below your knees.",
   "Bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up.",
   "Now grasp the barbell using an overhand (pronated) grip and unlock it from the smith machine rack. Then let it hang directly in front of you as your arms hang extended perpendicular to the floor and your torso. This is your starting position.",
   "While keeping the torso stationary, lift the barbell as you breathe out, keeping the elbows close to the body and not doing any force with the forearm other than holding the weights. On the top contracted position, squeeze the back muscles and hold for a second.",
   "Slowly lower the weight again to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把史密斯機的槓鈴設在膝蓋下方約 5 公分的高度。",
   "膝蓋微彎，從腰部往前彎，背部保持打直，直到上半身幾乎與地面平行。小提醒：記得抬頭。",
   "用正手（掌心朝下）握住槓鈴，從史密斯機上解鎖。讓槓鈴垂在正前方，手臂伸直、與地面和上半身垂直。這是起始姿勢。",
   "上半身保持不動，吐氣把槓鈴往上拉，手肘貼近身體，前臂只負責握住不出力。在頂端收縮時夾緊背部肌肉，停留 1 秒。",
   "吸氣，慢慢把重量放回起始位置。",
   "重複到建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "smith-machine-calf-raise",
  "zh": "史密斯提踵",
  "en": "Smith Machine Calf Raise",
  "equip": "smith",
  "primary": [
   "calves"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "腳跟盡量抬高，在頂端停 1 秒",
  "steps": [
   "Place a block or weight plate below the bar on the Smith machine. Set the bar to a position that best matches your height. Once the correct height is chosen and the bar is loaded, step onto the plates with the balls of your feet and place the bar on the back of your shoulders.",
   "Take the bar with both hands facing forward. Rotate the bar to unrack it. This will be your starting position.",
   "Raise your heels as high as possible by pushing off of the balls of your feet, flexing your calf at the top of the contraction. Your knees should remain extended. Hold the contracted position for a second before you start to go back down.",
   "Return slowly to the starting position as you breathe in while lowering your heels.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "在史密斯機槓鈴下方放一塊踏板或槓片，把槓鈴調到適合你身高的位置。掛好重量後，用前腳掌站上踏板，把槓鈴放在肩膀後側。",
   "雙手正握槓鈴，轉動槓鈴解鎖。這是起始姿勢。",
   "用前腳掌往下推，把腳跟盡量抬高，在頂端收縮小腿。膝蓋保持伸直。維持收縮 1 秒再開始往下。",
   "吸氣，慢慢放下腳跟，回到起始姿勢。",
   "重複到建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "smith-machine-close-grip-bench-press",
  "zh": "史密斯窄握臥推",
  "en": "Smith Machine Close-Grip Bench Press",
  "equip": "smith",
  "primary": [
   "triceps"
  ],
  "secondary": [
   "chest",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "手肘全程貼近身體，下放要慢",
  "steps": [
   "Place a flat bench underneath the smith machine. Place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Once the weight you need is selected, lie down on the flat bench. Using a close and pronated grip (palms facing forward) that is around shoulder width, unlock the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
   "As you breathe in, come down slowly until you feel the bar on your middle chest. Tip: Make sure that as opposed to a regular bench press, you keep the elbows close to the torso at all times in order to maximize triceps involvement.",
   "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your triceps muscles. Lock your arms in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up.",
   "Repeat the movement for the prescribed amount of repetitions.",
   "When you are done, lock the bar back in the rack."
  ],
  "stepsZh": [
   "在史密斯機下方放一張平板臥推椅。把槓鈴設在躺下時手臂幾乎伸直就能碰到的高度。選好重量後躺上臥推椅，用正手（掌心朝前）、約與肩同寬的窄握距握住槓鈴，解鎖後手臂伸直把槓鈴撐在正上方。這是起始姿勢。",
   "吸氣，慢慢放下槓鈴直到碰到胸口中段。小提醒：跟一般臥推不同，手肘要全程貼近身體，才能讓三頭出最多力。",
   "停頓 1 秒後，吐氣用三頭把槓鈴推回起始位置。手臂伸直後停 1 秒，再慢慢往下。小提醒：下放的時間至少要是上推的 2 倍。",
   "重複到指定次數。",
   "做完後把槓鈴鎖回掛鉤上。"
  ],
  "move": "push"
 },
 {
  "id": "smith-machine-decline-press",
  "zh": "史密斯下斜臥推",
  "en": "Smith Machine Decline Press",
  "equip": "smith",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "肩胛骨收緊，槓鈴放到胸口再推起",
  "steps": [
   "Position a decline bench in the rack so that the bar will be above your chest. Load an appropriate weight and take your place on the bench.",
   "Rotate the bar to unhook it from the rack and fully extend your arms. Your back should be slightly arched and your shoulder blades retracted. This will be your starting position.",
   "Begin the movement by flexing your arms, lowering the bar to your chest.",
   "Pause briefly, and then extend your arms to push the weight back to the starting position.",
   "After completing the desired number of repetitions, rotate the bar to rack the weight."
  ],
  "stepsZh": [
   "把下斜臥推椅放在史密斯機內，讓槓鈴位在胸口正上方。掛上適當重量後躺上臥推椅。",
   "轉動槓鈴解鎖，手臂完全伸直。背部微微拱起，肩胛骨往後收。這是起始姿勢。",
   "彎曲手臂，把槓鈴放到胸口。",
   "稍微停頓，再伸直手臂把重量推回起始位置。",
   "完成需要的次數後，轉動槓鈴掛回去。"
  ],
  "move": "push"
 },
 {
  "id": "smith-machine-hip-raise",
  "zh": "史密斯舉腿抬臀",
  "en": "Smith Machine Hip Raise",
  "equip": "smith",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "用腹部捲起骨盆，膝蓋保持微彎",
  "steps": [
   "Position a bench in the rack and load the bar to an appropriate weight. Lie down on the bench, placing the bottom of your feet against the bar. Unlock the bar and extend your legs. You may need to use your hands to assist you. For added stability grasp the sides of the Smith Machine. This will be your starting position.",
   "Initiate the movement by rotating your pelvis, flexing your spine to raise your hips off of the bench. Maintain a slight bend in the knees throughout the motion.",
   "After a brief pause, return the hips to the bench.",
   "Repeat for the desired number of repetitions."
  ],
  "stepsZh": [
   "把臥推椅放在史密斯機內，槓鈴掛上適當重量。躺在臥推椅上，腳底抵住槓鈴。解鎖槓鈴並把腿伸直，必要時可以用手輔助。想更穩可以抓住史密斯機兩側。這是起始姿勢。",
   "轉動骨盆、捲起脊椎，把臀部抬離臥推椅。全程膝蓋保持微彎。",
   "稍微停頓後，把臀部放回臥推椅上。",
   "重複到需要的次數。"
  ],
  "move": "core"
 },
 {
  "id": "smith-machine-incline-bench-press",
  "zh": "史密斯上斜臥推",
  "en": "Smith Machine Incline Bench Press",
  "equip": "smith",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "槓鈴對準上胸，下放要慢",
  "steps": [
   "Place an incline bench underneath the smith machine. Place the barbell at a height that you can reach when lying down and your arms are almost fully extended. Once the weight you need is selected, lie down on the incline bench and make sure your upper chest is aligned with the barbell. Using a pronated grip (palms facing forward) that is wider than shoulder width, unlock the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.",
   "As you breathe in, come down slowly until you feel the bar on your upper chest.",
   "After a second pause, bring the bar back to the starting position as you breathe out and push the bar using your chest muscles. Lock your arms in the contracted position, hold for a second and then start coming down slowly again. Tip: It should take at least twice as long to go down than to come up.",
   "Repeat the movement for the prescribed amount of repetitions.",
   "When you are done, place the bar back in the rack."
  ],
  "stepsZh": [
   "在史密斯機下方放一張上斜臥推椅。把槓鈴設在躺下時手臂幾乎伸直就能碰到的高度。選好重量後躺上去，確認上胸對準槓鈴。用正手（掌心朝前）、比肩略寬的握距握住，解鎖後手臂伸直把槓鈴撐在正上方。這是起始姿勢。",
   "吸氣，慢慢放下槓鈴直到碰到上胸。",
   "停頓 1 秒後，吐氣用胸肌把槓鈴推回起始位置。手臂伸直後停 1 秒，再慢慢往下。小提醒：下放的時間至少要是上推的 2 倍。",
   "重複到指定次數。",
   "做完後把槓鈴掛回去。"
  ],
  "move": "push"
 },
 {
  "id": "smith-machine-leg-press",
  "zh": "史密斯躺姿腿推",
  "en": "Smith Machine Leg Press",
  "equip": "smith",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "推起時膝蓋不要鎖死",
  "steps": [
   "Position a Smith machine bar a couple feet off of the ground. Ensure that it is resting on the safeties. After loading the bar to an appropriate weight, lie underneath the bar. Place the middle of your feet on the bar, tucking your knees to your chest. This will be your starting position.",
   "Begin the movement by driving through your feet to move the bar upward, extending the hips and knees. Do not lock out your knees.",
   "At the top of the motion, pause briefly before returning to the starting position."
  ],
  "stepsZh": [
   "把史密斯機槓鈴設在離地約 60 公分高，確認它架在安全槓上。掛上適當重量後躺到槓鈴下方，腳掌中段踩在槓鈴上，膝蓋收向胸口。這是起始姿勢。",
   "雙腳用力往上推動槓鈴，伸展髖部和膝蓋。膝蓋不要鎖死。",
   "在頂端稍微停頓，再回到起始姿勢。"
  ],
  "move": "push"
 },
 {
  "id": "smith-machine-one-arm-upright-row",
  "zh": "史密斯單手直立划船",
  "en": "Smith Machine One-Arm Upright Row",
  "equip": "smith",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "biceps",
   "traps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "手肘朝外帶動，上臂抬到與地面平行",
  "steps": [
   "With the bar at thigh level, load an appropriate weight.",
   "Take a wide grip on the bar and unhook the weight, removing your off hand from the bar. Your arm should be extended as you stand up straight with your head and chest up. This will be your starting position.",
   "Begin the movement by flexing the elbow, raising the upper arm with the elbow pointed out. Continue until your upper arm is parallel to the floor.",
   "After a brief pause, return the weight to the starting position.",
   "Repeat for the desired number of repetitions before engaging the hooks to rack the weight."
  ],
  "stepsZh": [
   "把槓鈴設在大腿高度，掛上適當重量。",
   "寬握槓鈴並解開掛鉤，接著把另一隻手放開。手臂伸直，身體站直、抬頭挺胸。這是起始姿勢。",
   "彎曲手肘，手肘朝外把上臂往上抬，直到上臂與地面平行。",
   "稍微停頓後，把重量放回起始位置。",
   "做完需要的次數後，把槓鈴掛回掛鉤上。"
  ],
  "move": "pull"
 },
 {
  "id": "smith-machine-reverse-calf-raises",
  "zh": "史密斯反向提踵",
  "en": "Smith Machine Reverse Calf Raises",
  "equip": "smith",
  "primary": [
   "calves"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "膝蓋全程固定，只靠腳尖往上翹",
  "steps": [
   "Adjust the barbell on the smith machine to fit your height and align a raised platform right under the bar.",
   "Stand on the platform with the heels of your feet secured on top of it with the balls of your feet extending off it. Position your toes facing forward with a shoulder width stance.",
   "Now, place your shoulders under the barbell while maintaining the foot positioning described and push the barbell up by extending your hips and knees until your torso is standing erect. The knees should be kept with a slight bend; never locked. This will be your starting position. Tip: The barbell on your back is only for balance purposes.",
   "Raise the balls of your feet as you breathe out by extending your toes as high as possible and flexing your calf. Ensure that the knee is kept stationary at all times. There should be no bending at any time. Hold the contracted position for a second before you start to go back down.",
   "Slowly go back down to the starting position as you breathe in by lowering the balls of your feet and toes.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把史密斯機槓鈴調到適合你身高的位置，在槓鈴正下方放一個墊高的踏台。",
   "腳跟穩穩踩在踏台上，前腳掌懸空在踏台外。腳尖朝前，雙腳與肩同寬。",
   "維持上述腳的位置，把肩膀放到槓鈴下方，伸展髖部和膝蓋把槓鈴頂起，直到身體站直。膝蓋保持微彎，不要鎖死。這是起始姿勢。小提醒：背上的槓鈴只是用來維持平衡。",
   "吐氣，把前腳掌和腳尖盡量往上翹，收縮小腿前側。膝蓋全程固定，不要彎曲。維持收縮 1 秒再開始往下。",
   "吸氣，慢慢放下前腳掌和腳尖，回到起始姿勢。",
   "重複到建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "smith-machine-stiff-legged-deadlift",
  "zh": "史密斯直腿硬舉",
  "en": "Smith Machine Stiff-Legged Deadlift",
  "equip": "smith",
  "primary": [
   "hamstrings"
  ],
  "secondary": [
   "glutes",
   "lower back"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "背部全程打直，感覺到大腿後側拉伸就起身",
  "steps": [
   "To begin, set the bar on the smith machine to a height that is around the middle of your thighs. Once the correct height is chosen and the bar is loaded, grasp the bar using a pronated (palms forward) grip that is shoulder width apart. You may need some wrist wraps if using a significant amount of weight.",
   "Lift the bar up by fully extending your arms while keeping your back straight. Stand with your torso straight and your legs spaced using a shoulder width or narrower stance. The knees should be slightly bent. This is your starting position.",
   "Keeping the knees stationary, lower the barbell to over the top of your feet by bending at the waist while keeping your back straight. Keep moving forward as if you were going to pick something from the floor until you feel a stretch on the hamstrings. Exhale as you perform this movement",
   "Start bringing your torso up straight again as soon as you feel the hamstrings stretch by extending your hips and waist until you are back at the starting position. Inhale as you perform this movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把史密斯機槓鈴設在大約大腿中段的高度。掛好重量後，用正手（掌心朝後）、與肩同寬握住槓鈴。重量很重時可以使用護腕帶。",
   "手臂完全伸直把槓鈴拿起，背部保持打直。身體站直，雙腳與肩同寬或更窄，膝蓋微彎。這是起始姿勢。",
   "膝蓋固定不動，背部打直從腰部往前彎，把槓鈴放到腳背上方。像要撿地上的東西一樣持續往前，直到感覺大腿後側有拉伸感。這段吐氣。",
   "一感覺到大腿後側拉伸，就伸展髖部和腰部把上半身挺直，回到起始姿勢。這段吸氣。",
   "重複到建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "smith-machine-upright-row",
  "zh": "史密斯直立划船",
  "en": "Smith Machine Upright Row",
  "equip": "smith",
  "primary": [
   "traps"
  ],
  "secondary": [
   "biceps",
   "middle back",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "用手肘帶動，手肘要一直高於前臂",
  "steps": [
   "To begin, set the bar on the smith machine to a height that is around the middle of your thighs. Once the correct height is chosen and the bar is loaded, grasp the bar using a pronated (palms forward) grip that is shoulder width apart. You may need some wrist wraps if using a significant amount of weight.",
   "Lift the barbell up and fully extend your arms with your back straight. There should be a slight bend at the elbows. This is the starting position.",
   "Use your side shoulders to lift the bar as you exhale. The bar should be close to the body as you move it up. Continue to lift it until it nearly touches your chin. Tip: Your elbows should drive the motion. As you lift the bar, your elbows should always be higher than your forearms. Also, keep your torso stationary and pause for a second at the top of the movement.",
   "Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "把史密斯機槓鈴設在大約大腿中段的高度。掛好重量後，用正手（掌心朝後）、與肩同寬握住槓鈴。重量很重時可以使用護腕帶。",
   "把槓鈴拿起，手臂伸直、背部打直，手肘保持微彎。這是起始姿勢。",
   "吐氣，用肩膀側邊的力量把槓鈴往上拉，槓鈴貼近身體，拉到快碰到下巴為止。小提醒：用手肘帶動動作，往上拉時手肘要一直高於前臂。上半身保持不動，在頂端停 1 秒。",
   "吸氣，慢慢把槓鈴放回起始位置。",
   "重複到建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "smith-single-leg-split-squat",
  "zh": "史密斯保加利亞分腿蹲",
  "en": "Smith Single-Leg Split Squat",
  "equip": "smith",
  "primary": [
   "quadriceps"
  ],
  "secondary": [
   "calves",
   "glutes",
   "hamstrings"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "身體保持直立，主要用前腳腳跟推起",
  "steps": [
   "To begin, place a flat bench 2-3 feet behind the smith machine. Then, set the bar on the height that best matches your height. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.",
   "Hold on to the bar using both arms at each side (palms facing forward), unlock it and lift it off the rack by first pushing with your legs and at the same time straightening your torso.",
   "Position your legs by placing one foot slightly forward under the bar and extending your other leg back and place the top of your foot on the bench. This will be your starting position",
   "Begin to slowly lower the bar by bending the knee as you maintain a straight posture with the head up. Continue down until the angle between the upper leg and the calf becomes slightly less than 90-degrees (which is the point in which the upper legs are below parallel to the floor). Inhale as you perform this portion of the movement. Tip: If you performed the exercise correctly, the front of the knee should make an imaginary straight line with the toes that is perpendicular to the front. If your knee is past that imaginary line (if it is past your toes) then you are placing undue stress on the knee and the exercise has been performed incorrectly.",
   "Begin to raise the bar as you exhale by pushing the floor with the heel of your foot mainly as you straighten your leg again and go back to the starting position.",
   "Repeat for the recommended amount of repetitions.",
   "Switch legs and repeat the movement."
  ],
  "stepsZh": [
   "在史密斯機後方約 60～90 公分處放一張平板臥推椅，把槓鈴調到適合你身高的位置。掛好重量後走到槓鈴下方，把槓鈴放在肩膀後側（脖子稍下方）。",
   "雙手在兩側握住槓鈴（掌心朝前），解鎖後先用腿推、同時挺直上半身，把槓鈴從掛鉤上抬起。",
   "一隻腳稍微往前放在槓鈴下方，另一隻腳往後伸，腳背放在臥推椅上。這是起始姿勢。",
   "吸氣，彎曲前膝慢慢往下蹲，身體保持直立、抬頭。蹲到大腿與小腿夾角略小於 90 度（大腿略低於與地面平行）。小提醒：動作正確時，膝蓋前緣大約和腳尖在同一條垂直線上；如果膝蓋明顯超過腳尖，膝蓋負擔會太大，表示姿勢不對。",
   "吐氣，主要用前腳腳跟踩地，把腿伸直回到起始姿勢。",
   "重複到建議次數。",
   "換腳再做一次。"
  ],
  "move": "push"
 },
 {
  "id": "standing-cable-chest-press",
  "zh": "站姿滑輪推胸",
  "en": "Standing Cable Chest Press",
  "equip": "cable",
  "primary": [
   "chest"
  ],
  "secondary": [
   "shoulders",
   "triceps"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "身體其他部位保持不動，雙手往前推並靠攏",
  "steps": [
   "Position dual pulleys to chest height and select an appropriate weight. Stand a foot or two in front of the cables, holding one in each hand. You can stagger your stance for better stability.",
   "Position the upper arm at a 90 degree angle with the shoulder blades together. This will be your starting position.",
   "Keeping the rest of the body stationary, extend through the elbows to press the handles forward, drawing them together in front of you.",
   "Pause at the top of the motion, and return to the starting position."
  ],
  "stepsZh": [
   "把兩側滑輪調到胸口高度並選好重量。站在繩索前方約 30～60 公分處，兩手各握一個握把。雙腳可以前後站以增加穩定。",
   "上臂呈 90 度，肩胛骨往後夾緊。這是起始姿勢。",
   "身體其他部位保持不動，伸直手肘把握把往前推，並在身體前方靠攏。",
   "在推到底時稍微停頓，再回到起始姿勢。"
  ],
  "move": "push"
 },
 {
  "id": "standing-cable-lift",
  "zh": "站姿滑輪由下往上斜拉",
  "en": "Standing Cable Lift",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "背部打直，用轉體帶動手臂往上拉",
  "steps": [
   "Connect a standard handle on a tower, and move the cable to the lowest pulley position.",
   "With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable. Your outstretched arm should be aligned with the cable.",
   "With your feet positioned shoulder width apart, squat down and grab the handle with both hands. Your arms should still be fully extended.",
   "In one motion, pull the handle up and across your body until your arms are in a fully-extended position above your head.",
   "Keep your back straight and your arms close to your body as you pivot your back foot and straighten your legs to get a full range of motion.",
   "Retract your arms and then your body. Return to the neutral position in a slow and controlled manner.",
   "Repeat to failure.",
   "Then, reposition and repeat the same series of movements on the opposite side."
  ],
  "stepsZh": [
   "在龍門架裝上一般握把，把滑輪調到最低位置。",
   "側身對著龍門架，一手抓住握把後往外走開。距離滑輪大約一個手臂長，讓繩索保持張力，伸直的手臂與繩索成一直線。",
   "雙腳與肩同寬，蹲下用雙手握住握把，手臂仍保持伸直。",
   "一口氣把握把斜向往上拉過身體，直到雙臂完全伸直舉到頭頂斜上方。",
   "背部打直、手臂靠近身體，同時轉動後腳、把腿伸直，做出完整的動作幅度。",
   "先收回手臂，再帶回身體，慢慢有控制地回到起始位置。",
   "重複到力竭。",
   "換邊站好，在另一側做同樣的動作。"
  ],
  "move": "core"
 },
 {
  "id": "standing-cable-wood-chop",
  "zh": "站姿滑輪伐木",
  "en": "Standing Cable Wood Chop",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "核心收緊，用轉體帶動手臂往下拉",
  "steps": [
   "Connect a standard handle to a tower, and move the cable to the highest pulley position.",
   "With your side to the cable, grab the handle with one hand and step away from the tower. You should be approximately arm's length away from the pulley, with the tension of the weight on the cable. Your outstretched arm should be aligned with the cable.",
   "With your feet positioned shoulder width apart, reach upward with your other hand and grab the handle with both hands. Your arms should still be fully extended.",
   "In one motion, pull the handle down and across your body to your front knee while rotating your torso.",
   "Keep your back and arms straight and core tight while you pivot your back foot and bend your knees to get a full range of motion.",
   "Maintain your stance and straight arms. Return to the neutral position in a slow and controlled manner.",
   "Repeat to failure.",
   "Then, reposition and repeat the same series of movements on the opposite side."
  ],
  "stepsZh": [
   "在龍門架裝上一般握把，把滑輪調到最高位置。",
   "側身對著龍門架，一手抓住握把後往外走開。距離滑輪大約一個手臂長，讓繩索保持張力，伸直的手臂與繩索成一直線。",
   "雙腳與肩同寬，另一手往上伸，用雙手握住握把，手臂仍保持伸直。",
   "一口氣轉動上半身，把握把斜向往下拉過身體，拉到前側膝蓋旁。",
   "背部和手臂打直、核心收緊，同時轉動後腳、膝蓋彎曲，做出完整的動作幅度。",
   "維持站姿和手臂伸直，慢慢有控制地回到起始位置。",
   "重複到力竭。",
   "換邊站好，在另一側做同樣的動作。"
  ],
  "move": "core"
 },
 {
  "id": "standing-leg-curl",
  "zh": "站姿腿彎舉",
  "en": "Standing Leg Curl",
  "equip": "machine",
  "primary": [
   "hamstrings"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "大腿貼住軟墊，只讓小腿往上勾",
  "steps": [
   "Adjust the machine lever to fit your height and lie with your torso bent at the waist facing forward around 30-45 degrees (since an angled position is more favorable for hamstrings recruitment) with the pad of the lever on the back of your right leg (just a few inches under the calves) and the front of the right leg on top of the machine pad.",
   "Keeping the torso bent forward, ensure your leg is fully stretched and grab the side handles of the machine. Position your toes straight. This will be your starting position.",
   "As you exhale, curl your right leg up as far as possible without lifting the upper leg from the pad. Once you hit the fully contracted position, hold it for a second.",
   "As you inhale, bring the legs back to the initial position. Repeat for the recommended amount of repetitions.",
   "Perform the same exercise now for the left leg."
  ],
  "stepsZh": [
   "把機器的槓桿調到適合你的身高，上半身從腰部往前傾約 30～45 度（這個角度更容易練到大腿後側）。槓桿軟墊抵在右腿後側（小腿肚下方幾公分），右腿前側靠在機器軟墊上。",
   "上半身保持前傾，確認右腿完全伸直，雙手抓住機器兩側握把，腳尖朝正下方。這是起始姿勢。",
   "吐氣，右腿盡量往上勾，大腿不要離開軟墊。勾到最緊的位置時停 1 秒。",
   "吸氣，把腿放回起始位置。重複到建議次數。",
   "換左腿做同樣的動作。"
  ],
  "move": "pull"
 },
 {
  "id": "standing-low-pulley-deltoid-raise",
  "zh": "低位滑輪單手側平舉",
  "en": "Standing Low-Pulley Deltoid Raise",
  "equip": "cable",
  "primary": [
   "shoulders"
  ],
  "secondary": [
   "forearms"
  ],
  "level": "beginner",
  "compound": false,
  "cue": "手臂舉到肩膀高度就好，慢慢放下",
  "steps": [
   "Start by standing to the right side of a low pulley row. Use your left hand to come across the body and grab a single handle attached to the low pulley with a pronated grip (palms facing down). Rest your arm in front of you. Your right hand should grab the machine for better support and balance.",
   "Make sure that your back is erect and your feet are shoulder width apart from each other. This is the starting position.",
   "Begin to use the left hand and come across your body out until it is elevated to shoulder height while exhaling.",
   "Feel the contraction at the top for a second and begin to slowly lower the handle back down to the original starting position while inhaling.",
   "Repeat for the recommended amount of repetitions.",
   "Switch arms and repeat the exercise."
  ],
  "stepsZh": [
   "站在低位滑輪的右側。左手橫過身體前方，用正手（掌心朝下）握住接在低位滑輪的單手握把，手臂放在身體前方。右手扶住機器以保持平衡。",
   "背部挺直，雙腳與肩同寬。這是起始姿勢。",
   "吐氣，左手從身體前方往外側抬起，直到舉到肩膀高度。",
   "在頂端感受收縮 1 秒，吸氣慢慢把握把放回起始位置。",
   "重複到建議次數。",
   "換手再做一次。"
  ],
  "move": "push"
 },
 {
  "id": "standing-low-pulley-one-arm-triceps-extension",
  "zh": "單手滑輪過頭三頭伸展",
  "en": "Standing Low-Pulley One-Arm Triceps Extension",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [
   "chest",
   "shoulders"
  ],
  "level": "intermediate",
  "compound": false,
  "cue": "上臂貼近頭部保持垂直，只動前臂",
  "steps": [
   "Grab a single handle with your left arm next to the low pulley machine. Turn away from the machine keeping the handle to the side of your body with your arm fully extended. Now use both hands to elevate the single handle directly above the head with the palm facing forward. Keep your upper arm completely vertical (perpendicular to the floor) and put your right hand on your left elbow to help keep it steady. This is the starting position.",
   "Keeping your upper arms close to your head (elbows in) and perpendicular to the floor, lower the resistance in a semicircular motion behind your head until your forearms touch your biceps. Tip: The upper arms should remain stationary and only the forearms should move. Breathe in as you perform this step.",
   "Go back to the starting position by using the triceps to raise the single handle. Breathe out as you perform this step.",
   "Repeat for the recommended amount of repetitions.",
   "Switch arms and repeat the exercise."
  ],
  "stepsZh": [
   "站在低位滑輪旁，用左手抓住單手握把。轉身背對機器，握把放在身體側邊、手臂伸直。接著用雙手把握把舉到頭頂正上方，掌心朝前。上臂保持完全垂直，右手扶住左手肘幫助穩定。這是起始姿勢。",
   "上臂貼近頭部（手肘內收）並垂直地面，前臂以半圓弧度往頭後方放下，直到前臂碰到二頭。小提醒：上臂固定不動，只有前臂移動。這段吸氣。",
   "用三頭把握把舉回起始位置。這段吐氣。",
   "重複到建議次數。",
   "換手再做一次。"
  ],
  "move": "push"
 },
 {
  "id": "standing-one-arm-cable-curl",
  "zh": "站姿單手滑輪彎舉",
  "en": "Standing One-Arm Cable Curl",
  "equip": "cable",
  "primary": [
   "biceps"
  ],
  "secondary": [],
  "level": "intermediate",
  "compound": false,
  "cue": "上臂固定不動，只有前臂移動",
  "steps": [
   "Start out by grabbing single handle next to the low pulley machine. Make sure you are far enough from the machine so that your arm is supporting the weight.",
   "Make sure that your upper arm is stationary, perpendicular to the floor with elbows in and palms facing forward. Your non lifting arm should be grabbing your waist. This will allow you to keep your balance.",
   "Slowly begin to curl the single handle upwards while keeping the upper arm stationary until your forearm touches your bicep while exhaling. Tip: Only the forearm should move.",
   "Hold the contraction position as you squeeze the bicep and then lower the single handle back down to the starting position as you inhale.",
   "Repeat for the recommended amount of repetitions.",
   "Switch arms while performing this exercise."
  ],
  "stepsZh": [
   "站在低位滑輪旁，握住單手握把。站得離機器遠一點，讓手臂承受重量。",
   "上臂固定、垂直地面，手肘內收，掌心朝前。另一隻手扶住腰部，幫助保持平衡。",
   "吐氣，上臂保持不動，慢慢把握把往上彎舉，直到前臂碰到二頭。小提醒：只有前臂移動。",
   "維持收縮並擠壓二頭，再吸氣把握把放回起始位置。",
   "重複到建議次數。",
   "換手再做一次。"
  ],
  "move": "pull"
 },
 {
  "id": "standing-rope-crunch",
  "zh": "站姿繩索捲腹",
  "en": "Standing Rope Crunch",
  "equip": "cable",
  "primary": [
   "abdominals"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "用腹肌捲起脊椎往下壓",
  "steps": [
   "Attach a rope to a high pulley and select an appropriate weight.",
   "Stand with your back to the cable tower. Take the rope with both hands over your shoulders, holding it to your upper chest. This will be your starting position.",
   "Perform the movement by flexing the spine, crunching the weight down as far as you can.",
   "Hold the peak contraction for a moment before returning to the starting position."
  ],
  "stepsZh": [
   "在高位滑輪裝上繩索並選好適當重量。",
   "背對龍門架站好，雙手從肩膀上方握住繩索，貼在上胸。這是起始姿勢。",
   "彎曲脊椎，把重量盡量往下捲壓。",
   "在最緊的位置停留一下，再回到起始姿勢。"
  ],
  "move": "core"
 },
 {
  "id": "triceps-overhead-extension-with-rope",
  "zh": "繩索過頭三頭伸展",
  "en": "Triceps Overhead Extension with Rope",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂固定不動，只用手肘伸直",
  "steps": [
   "Attach a rope to a low pulley. After selecting an appropriate weight, grasp the rope with both hands and face away from the cable.",
   "Position your hands behind your head with your elbows point straight up. Your elbows should start out flexed, and you can stagger your stance and lean gently away from the machine to create greater stability. This will be your starting position.",
   "To perform the movement, extend through the elbow while keeping the upper arm in position, raising your hands above your head.",
   "Squeeze your triceps at the top of the movement, and slowly lower the weight back to the start position."
  ],
  "stepsZh": [
   "在低位滑輪裝上繩索。選好適當重量後，雙手握住繩索，背對滑輪。",
   "雙手放在頭後方，手肘朝正上方。起始時手肘彎曲，雙腳可以前後站並稍微往前傾，增加穩定。這是起始姿勢。",
   "上臂保持不動，伸直手肘把雙手舉到頭頂上方。",
   "在頂端夾緊三頭，再慢慢把重量放回起始位置。"
  ],
  "move": "push"
 },
 {
  "id": "triceps-pushdown---rope-attachment",
  "zh": "繩索三頭下壓",
  "en": "Triceps Pushdown - Rope Attachment",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂貼緊身體，壓到底時把繩索往兩側拉開",
  "steps": [
   "Attach a rope attachment to a high pulley and grab with a neutral grip (palms facing each other).",
   "Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the floor. The forearms should be pointing up towards the pulley as they hold the rope with the palms facing each other. This is your starting position.",
   "Using the triceps, bring the rope down as you bring each side of the rope to the side of your thighs. At the end of the movement the arms are fully extended and perpendicular to the floor. The upper arms should always remain stationary next to your torso and only the forearms should move. Exhale as you perform this movement.",
   "After holding for a second, at the contracted position, bring the rope slowly up to the starting point. Breathe in as you perform this step.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "在高位滑輪裝上繩索，用對握（掌心相對）握住。",
   "身體站直，上半身稍微前傾，上臂貼近身體並垂直地面。前臂朝上指向滑輪，掌心相對握住繩索。這是起始姿勢。",
   "用三頭把繩索往下壓，同時把繩索兩端分別帶到大腿兩側。動作結束時手臂完全伸直、垂直地面。上臂全程固定在身體旁，只有前臂移動。這段吐氣。",
   "在收縮位置停留 1 秒後，慢慢把繩索放回起始位置。這段吸氣。",
   "重複到建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "triceps-pushdown---v-bar-attachment",
  "zh": "V 型把三頭下壓",
  "en": "Triceps Pushdown - V-Bar Attachment",
  "equip": "cable",
  "primary": [
   "triceps"
  ],
  "secondary": [],
  "level": "beginner",
  "compound": false,
  "cue": "上臂固定在身體旁，只有前臂移動",
  "steps": [
   "Attach a V-Bar to a high pulley and grab with an overhand grip (palms facing down) at shoulder width.",
   "Standing upright with the torso straight and a very small inclination forward, bring the upper arms close to your body and perpendicular to the floor. The forearms should be pointing up towards the pulley as they hold the bar. The thumbs should be higher than the small finger. This is your starting position.",
   "Using the triceps, bring the bar down until it touches the front of your thighs and the arms are fully extended perpendicular to the floor. The upper arms should always remain stationary next to your torso and only the forearms should move. Exhale as you perform this movement.",
   "After a second hold at the contracted position, bring the V-Bar slowly up to the starting point. Breathe in as you perform this step.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "在高位滑輪裝上 V 型把，用正手（掌心朝下）、與肩同寬握住。",
   "身體站直，上半身稍微前傾，上臂貼近身體並垂直地面。前臂朝上指向滑輪握住握把，大拇指位置要比小指高。這是起始姿勢。",
   "用三頭把握把往下壓，直到碰到大腿前側、手臂完全伸直垂直地面。上臂全程固定在身體旁，只有前臂移動。這段吐氣。",
   "在收縮位置停留 1 秒後，慢慢把 V 型把放回起始位置。這段吸氣。",
   "重複到建議次數。"
  ],
  "move": "push"
 },
 {
  "id": "underhand-cable-pulldowns",
  "zh": "反手滑輪下拉",
  "en": "Underhand Cable Pulldowns",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back",
   "shoulders"
  ],
  "level": "beginner",
  "compound": true,
  "cue": "挺胸、手肘貼近身體，用背部把直桿拉下",
  "steps": [
   "Sit down on a pull-down machine with a wide bar attached to the top pulley. Adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
   "Grab the pull-down bar with the palms facing your torso (a supinated grip). Make sure that the hands are placed closer than the shoulder width.",
   "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.",
   "As you breathe out, pull the bar down until it touches your upper chest by drawing the shoulders and the upper arms down and back. Tip: Concentrate on squeezing the back muscles once you reach the fully contracted position and keep the elbows close to your body. The upper torso should remain stationary as your bring the bar to you and only the arms should move. The forearms should do no other work other than hold the bar.",
   "After a second on the contracted position, while breathing in, slowly bring the bar back to the starting position when your arms are fully extended and the lats are fully stretched.",
   "Repeat this motion for the prescribed amount of repetitions."
  ],
  "stepsZh": [
   "坐上滑輪下拉機，上方滑輪裝寬直桿。依身高調整大腿擋墊，防止身體被重量拉起來。",
   "用反手（掌心朝向自己）握住直桿，雙手握距比肩膀窄。",
   "雙臂往前伸直握住直桿，上半身往後仰約 30 度，下背微微拱起、挺胸。這是起始姿勢。",
   "吐氣，把肩膀和上臂往下、往後帶，把直桿拉到碰到上胸。小提醒：拉到底時專心夾緊背部肌肉，手肘貼近身體。上半身保持不動，只有手臂移動，前臂只負責握住直桿。",
   "在收縮位置停 1 秒，吸氣慢慢放回起始位置，讓手臂完全伸直、背闊肌充分伸展。",
   "重複到指定次數。"
  ],
  "move": "pull"
 },
 {
  "id": "upright-cable-row",
  "zh": "滑輪直立划船",
  "en": "Upright Cable Row",
  "equip": "cable",
  "primary": [
   "traps"
  ],
  "secondary": [
   "shoulders"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "用手肘帶動，手肘要一直高於前臂",
  "steps": [
   "Grasp a straight bar cable attachment that is attached to a low pulley with a pronated (palms facing your thighs) grip that is slightly less than shoulder width. The bar should be resting on top of your thighs. Your arms should be extended with a slight bend at the elbows and your back should be straight. This will be your starting position.",
   "Use your side shoulders to lift the cable bar as you exhale. The bar should be close to the body as you move it up. Continue to lift it until it nearly touches your chin. Tip: Your elbows should drive the motion. As you lift the bar, your elbows should always be higher than your forearms. Also, keep your torso stationary and pause for a second at the top of the movement.",
   "Lower the bar back down slowly to the starting position. Inhale as you perform this portion of the movement.",
   "Repeat for the recommended amount of repetitions."
  ],
  "stepsZh": [
   "用正手（掌心朝向大腿）、比肩略窄的握距，握住接在低位滑輪的直桿，直桿靠在大腿上。手臂伸直、手肘微彎，背部打直。這是起始姿勢。",
   "吐氣，用肩膀側邊的力量把直桿往上拉，直桿貼近身體，拉到快碰到下巴為止。小提醒：用手肘帶動動作，往上拉時手肘要一直高於前臂。上半身保持不動，在頂端停 1 秒。",
   "吸氣，慢慢把直桿放回起始位置。",
   "重複到建議次數。"
  ],
  "move": "pull"
 },
 {
  "id": "v-bar-pulldown",
  "zh": "V 型把滑輪下拉",
  "en": "V-Bar Pulldown",
  "equip": "cable",
  "primary": [
   "lats"
  ],
  "secondary": [
   "biceps",
   "middle back",
   "shoulders"
  ],
  "level": "intermediate",
  "compound": true,
  "cue": "上半身保持不動，用背闊肌把握把拉下",
  "steps": [
   "Sit down on a pull-down machine with a V-Bar attached to the top pulley.",
   "Adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.",
   "Grab the V-bar with the palms facing each other (a neutral grip). Stick your chest out and lean yourself back slightly (around 30-degrees) in order to better engage the lats. This will be your starting position.",
   "Using your lats, pull the bar down as you squeeze your shoulder blades. Continue until your chest nearly touches the V-bar. Exhale as you execute this motion. Tip: Keep the torso stationary throughout the movement.",
   "After a second hold on the contracted position, slowly bring the bar back to the starting position as you breathe in.",
   "Repeat for the prescribed number of repetitions."
  ],
  "stepsZh": [
   "坐上滑輪下拉機，上方滑輪裝上 V 型把。",
   "依身高調整大腿擋墊，防止身體被重量拉起來。",
   "用對握（掌心相對）握住 V 型把。挺胸、身體稍微往後仰約 30 度，讓背闊肌更好出力。這是起始姿勢。",
   "用背闊肌把握把往下拉，同時夾緊肩胛骨，拉到胸口快碰到 V 型把為止。這段吐氣。小提醒：上半身全程保持不動。",
   "在收縮位置停 1 秒，吸氣慢慢放回起始位置。",
   "重複到指定次數。"
  ],
  "move": "pull"
 }
] as Exercise[]

for (const ex of EXERCISES) Object.assign(ex, CARDIO_EXTRA[ex.id])
EXERCISES.push(...CARDIO_EXERCISES)

export const EXERCISE_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((x) => [x.id, x]))
