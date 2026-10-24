# 16Personalities (NERIS) — Answer→Type Algorithm Spec

A precise, self-contained specification of how the 60 free-test answers map to the
MBTI-style 5-letter type, plus the inverse (target type → answers).
Reverse-engineered and validated by producing all 32 labeled results (16 types × A/T),
every one hitting its target exactly.

NOTE: `weight[i]` (per-question weighting) is NOT yet measured; assume 1 (equal weight).
Equal-weight is sufficient to derive the correct type in all non-borderline cases.

---

## 1. Data model

- 60 questions. Each question has a fixed canonical `order` (0–59).
- Each question belongs to exactly ONE axis; 12 questions per axis.
- 5 axes and their two poles (pole[0] listed first):

  | axis | pole[0] | pole[1] |
  |------|---------|---------|
  | EI   | E (Extraverted) | I (Introverted) |
  | NS   | N (Intuitive)   | S (Observant)   |
  | TF   | T (Thinking)    | F (Feeling)     |
  | JP   | J (Judging)     | P (Prospecting) |
  | AT   | A (Assertive)   | T (Turbulent)   |

- Each question has `agreePole`: the pole reached by AGREEING with the statement.

## 2. Answer scale (IMPORTANT convention)

User selects one of 7 options per question. Internal value `a`:

    leftmost  = -3  = "fully Agree"
                -2, -1
                 0  = neutral
                +1, +2
    rightmost = +3  = "fully Disagree"

So AGREE is NEGATIVE, DISAGREE is POSITIVE. (This matches the live radio `value` attributes.)

## 3. SCORING: answers → type

```
POLES = { EI:['E','I'], NS:['N','S'], TF:['T','F'], JP:['J','P'], AT:['A','T'] }

score = { EI:0, NS:0, TF:0, JP:0, AT:0 }

for each question q with user answer a in [-3..+3]:
    towardAgree = -a                      # Agree(-3) -> +3 toward agreePole; Disagree(+3) -> -3
    if q.agreePole == POLES[q.axis][0]:   # agreeing pushes toward pole[0]
        s =  towardAgree
    else:                                 # agreeing pushes toward pole[1]
        s = -towardAgree
    score[q.axis] += s * weight[q]        # weight[q] assumed 1

# score[axis] > 0  => pole[0]   ;   < 0 => pole[1]   ;   ~0 => borderline (≈50%)
letters = {}
for axis in [EI,NS,TF,JP,AT]:
    letters[axis] = (score[axis] >= 0) ? POLES[axis][0] : POLES[axis][1]

type = letters.EI + letters.NS + letters.TF + letters.JP + "-" + letters.AT
# magnitude: displayed percentage ≈ 50 + normalize(|score[axis]|)/2  (exact normalize = f, unverified)
```

## 4. GENERATION: target type → answers (guaranteed hit, extreme)

```
# target e.g. INTJ-A  ->  { EI:'I', NS:'N', TF:'T', JP:'J', AT:'A' }
for each question q:
    want = target[q.axis]
    if want == q.agreePole:
        a = -3     # Agree (push hardest toward the pole you want)
    else:
        a = +3     # Disagree
```

Rule in plain words: for every statement, if the type you want has the letter that
"agreeing" leads to on that axis → slide fully to Agree; otherwise slide fully to Disagree.

## 5. Validation

- All 60 answers = +3 (all "Disagree") → by the scoring above yields **ISTP-A**.
  Confirmed against a real submitted test: result was exactly ISTP-A. All 5 axes matched.
- Generation rule used to target all 16 types (×A and ×T): 32/32 produced the intended type.

## 6. Unknowns (server-side)

- `weight[q]`: whether questions are equally weighted. (Measurable via single-question
  perturbation: all-neutral baseline, then one question = +3, read the axis %; Δ ∝ weight.)
- `f`: exact raw-score → percentage curve (linearity/saturation). Display side is ≈ 50 + score/2.

---

## 7. Lookup table (order | axis | agreePole | question text)

| order | axis | agreePole | question |
|-------|------|-----------|----------|
| 0 | EI | E | You regularly make new friends. |
| 1 | NS | N | Complex and novel ideas excite you more than simple and straightforward ones. |
| 2 | TF | F | You usually feel more persuaded by what resonates emotionally with you than by factual arguments. |
| 3 | JP | J | Your living and working spaces are clean and organized. |
| 4 | AT | A | You usually stay calm, even under a lot of pressure. |
| 5 | EI | I | You find the idea of networking or promoting yourself to strangers very daunting. |
| 6 | JP | J | You prioritize and plan tasks effectively, often completing them well before the deadline. |
| 7 | TF | F | People's stories and emotions speak louder to you than numbers or data. |
| 8 | JP | J | You like to use organizing tools like schedules and lists. |
| 9 | AT | T | Even a small mistake can cause you to doubt your overall abilities and knowledge. |
| 10 | EI | E | You feel comfortable just walking up to someone you find interesting and striking up a conversation. |
| 11 | NS | S | You are not too interested in discussions about various interpretations of creative works. |
| 12 | TF | T | You prioritize facts over people's feelings when determining a course of action. |
| 13 | JP | P | You often allow the day to unfold without any schedule at all. |
| 14 | AT | A | You rarely worry about whether you make a good impression on people you meet. |
| 15 | EI | E | You enjoy participating in team-based activities. |
| 16 | NS | N | You enjoy experimenting with new and untested approaches. |
| 17 | TF | F | You prioritize being sensitive over being completely honest. |
| 18 | NS | N | You actively seek out new experiences and knowledge areas to explore. |
| 19 | AT | T | You are prone to worrying that things will take a turn for the worse. |
| 20 | EI | I | You enjoy solitary hobbies or activities more than group ones. |
| 21 | NS | S | You cannot imagine yourself writing fictional stories for a living. |
| 22 | TF | T | You favor efficiency in decisions, even if it means disregarding some emotional aspects. |
| 23 | JP | J | You prefer to do your chores before allowing yourself to relax. |
| 24 | TF | T | In disagreements, you prioritize proving your point over preserving the feelings of others. |
| 25 | EI | I | You usually wait for others to introduce themselves first at social gatherings. |
| 26 | AT | T | Your mood can change very quickly. |
| 27 | TF | T | You are not easily swayed by emotional arguments. |
| 28 | JP | P | You often end up doing things at the last possible moment. |
| 29 | NS | N | You enjoy debating ethical dilemmas. |
| 30 | EI | E | You usually prefer to be around others rather than on your own. |
| 31 | NS | S | You become bored or lose interest when the discussion gets highly theoretical. |
| 32 | TF | F | When facts and feelings conflict, you usually find yourself following your heart. |
| 33 | JP | P | You find it challenging to maintain a consistent work or study schedule. |
| 34 | AT | A | You rarely second-guess the choices that you have made. |
| 35 | EI | E | Your friends would describe you as lively and outgoing. |
| 36 | NS | N | You are drawn to various forms of creative expression, such as writing. |
| 37 | TF | T | You usually base your choices on objective facts rather than emotional impressions. |
| 38 | JP | J | You like to have a to-do list for each day. |
| 39 | AT | A | You rarely feel insecure. |
| 40 | EI | I | You avoid making phone calls. |
| 41 | NS | N | You enjoy exploring unfamiliar ideas and viewpoints. |
| 42 | EI | E | You can easily connect with people you have just met. |
| 43 | JP | J | If your plans are interrupted, your top priority is to get back on track as soon as possible. |
| 44 | AT | T | You are still bothered by mistakes that you made a long time ago. |
| 45 | NS | S | You are not too interested in discussing theories on what the world could look like in the future. |
| 46 | AT | T | Your emotions control you more than you control them. |
| 47 | TF | F | When making decisions, you focus more on how the affected people might feel than on what is most logical or efficient. |
| 48 | JP | P | Your personal work style is closer to spontaneous bursts of energy than organized and consistent efforts. |
| 49 | AT | T | When someone thinks highly of you, you wonder how long it will take them to feel disappointed in you. |
| 50 | EI | I | You would love a job that requires you to work alone most of the time. |
| 51 | NS | S | You believe that pondering abstract philosophical questions is a waste of time. |
| 52 | EI | E | You feel more drawn to busy, bustling atmospheres than to quiet, intimate places. |
| 53 | TF | F | If a decision feels right to you, you often act on it without needing further proof. |
| 54 | AT | T | You often feel overwhelmed. |
| 55 | JP | J | You complete things methodically without skipping over any steps. |
| 56 | NS | N | You prefer tasks that require you to come up with creative solutions rather than follow concrete steps. |
| 57 | TF | F | You are more likely to rely on emotional intuition than logical reasoning when making a choice. |
| 58 | JP | P | You struggle with deadlines. |
| 59 | AT | A | You feel confident that things will work out for you. |

## 8. Machine-readable (JSON)

```json
[
 {"order":0,"axis":"EI","agreePole":"E"},{"order":1,"axis":"NS","agreePole":"N"},
 {"order":2,"axis":"TF","agreePole":"F"},{"order":3,"axis":"JP","agreePole":"J"},
 {"order":4,"axis":"AT","agreePole":"A"},{"order":5,"axis":"EI","agreePole":"I"},
 {"order":6,"axis":"JP","agreePole":"J"},{"order":7,"axis":"TF","agreePole":"F"},
 {"order":8,"axis":"JP","agreePole":"J"},{"order":9,"axis":"AT","agreePole":"T"},
 {"order":10,"axis":"EI","agreePole":"E"},{"order":11,"axis":"NS","agreePole":"S"},
 {"order":12,"axis":"TF","agreePole":"T"},{"order":13,"axis":"JP","agreePole":"P"},
 {"order":14,"axis":"AT","agreePole":"A"},{"order":15,"axis":"EI","agreePole":"E"},
 {"order":16,"axis":"NS","agreePole":"N"},{"order":17,"axis":"TF","agreePole":"F"},
 {"order":18,"axis":"NS","agreePole":"N"},{"order":19,"axis":"AT","agreePole":"T"},
 {"order":20,"axis":"EI","agreePole":"I"},{"order":21,"axis":"NS","agreePole":"S"},
 {"order":22,"axis":"TF","agreePole":"T"},{"order":23,"axis":"JP","agreePole":"J"},
 {"order":24,"axis":"TF","agreePole":"T"},{"order":25,"axis":"EI","agreePole":"I"},
 {"order":26,"axis":"AT","agreePole":"T"},{"order":27,"axis":"TF","agreePole":"T"},
 {"order":28,"axis":"JP","agreePole":"P"},{"order":29,"axis":"NS","agreePole":"N"},
 {"order":30,"axis":"EI","agreePole":"E"},{"order":31,"axis":"NS","agreePole":"S"},
 {"order":32,"axis":"TF","agreePole":"F"},{"order":33,"axis":"JP","agreePole":"P"},
 {"order":34,"axis":"AT","agreePole":"A"},{"order":35,"axis":"EI","agreePole":"E"},
 {"order":36,"axis":"NS","agreePole":"N"},{"order":37,"axis":"TF","agreePole":"T"},
 {"order":38,"axis":"JP","agreePole":"J"},{"order":39,"axis":"AT","agreePole":"A"},
 {"order":40,"axis":"EI","agreePole":"I"},{"order":41,"axis":"NS","agreePole":"N"},
 {"order":42,"axis":"EI","agreePole":"E"},{"order":43,"axis":"JP","agreePole":"J"},
 {"order":44,"axis":"AT","agreePole":"T"},{"order":45,"axis":"NS","agreePole":"S"},
 {"order":46,"axis":"AT","agreePole":"T"},{"order":47,"axis":"TF","agreePole":"F"},
 {"order":48,"axis":"JP","agreePole":"P"},{"order":49,"axis":"AT","agreePole":"T"},
 {"order":50,"axis":"EI","agreePole":"I"},{"order":51,"axis":"NS","agreePole":"S"},
 {"order":52,"axis":"EI","agreePole":"E"},{"order":53,"axis":"TF","agreePole":"F"},
 {"order":54,"axis":"AT","agreePole":"T"},{"order":55,"axis":"JP","agreePole":"J"},
 {"order":56,"axis":"NS","agreePole":"N"},{"order":57,"axis":"TF","agreePole":"F"},
 {"order":58,"axis":"JP","agreePole":"P"},{"order":59,"axis":"AT","agreePole":"A"}
]
```
