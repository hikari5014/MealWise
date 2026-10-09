// 動作資料來自 free-exercise-db（公眾領域 Unlicense，https://github.com/yuhonas/free-exercise-db）
// 中文名稱、器材分類、動作要點由好食光整理；照片在 public/exercises/<id>-0.webp、-1.webp
import type { Equip, FxMuscle } from '../lib/workout'

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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "pull"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "pull"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "push"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "push"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "pull"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "push"
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
  "move": "core"
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
  "move": "core"
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
  "move": "core"
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
  "move": "core"
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
  "move": "core"
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
  "move": "core"
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
  "move": "core"
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
  "move": "core"
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
  "move": "cardio"
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
  "move": "core"
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
  "move": "core"
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
  "move": "core"
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
  "move": "core"
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
  "move": "pull"
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
  "move": "cardio"
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
  "move": "core"
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
  "move": "cardio"
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
  "move": "cardio"
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
  "move": "cardio"
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
  "move": "cardio"
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
  "move": "cardio"
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
  "move": "cardio"
 }
] as Exercise[]

export const EXERCISE_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((x) => [x.id, x]))
