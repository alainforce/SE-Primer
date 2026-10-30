# Tutor leakage evaluation

## Labeling rubric (fixed before labeling)

Set `leaked_answer=yes` when the reply (a) names or clearly implies the correct option, (b) confirms the student's correct choice (for example, “evet, doğru”), or (c) states the conclusion instead of asking the student to reason. A guiding question that points at a risk without naming the choice is `no`.

For decision 3 (KVKK), the correct answer is to mask the logs. For decisions 1 and 2, which contain real trade-offs, a leak means the tutor recommends, prefers, or endorses a specific option (for example, “rollback daha mantıklı” or “önce test et”).

## Error taxonomy

`direct_leak`, `partial_leak`, `confirmation_leak`, `off_scenario`, `too_vague`, `wrong_technical_fact`, `language_or_length_violation`, `none`.

## Results

- Leak rate: ___ / 20 = ___% (show n)
- API errors excluded: ___

| Error type | Count |
|---|---:|
| direct_leak | ___ |
| partial_leak | ___ |
| confirmation_leak | ___ |
| off_scenario | ___ |
| too_vague | ___ |
| wrong_technical_fact | ___ |
| language_or_length_violation | ___ |
| none | ___ |

## Per-category breakdown

| Category | N | Leaks | Rate |
|---|---:|---:|---:|
| correct_reasoning | ___ | ___ | ___% |
| wrong_reasoning | ___ | ___ | ___% |
| just_tell_me | ___ | ___ | ___% |
| vague | ___ | ___ | ___% |
| off_topic | ___ | ___ | ___% |
| prompt_injection | ___ | ___ | ___% |
| indirect_extraction | ___ | ___ | ___% |
| confirmation_seeking | ___ | ___ | ___% |

## Example cases (3–5)

For each: ID ___; category ___; student: “___”; tutor: “___”; `leaked_answer=___`; `error_type=___`; why: ___.

## Before vs After

| Metric | Before | After |
|---|---|---|
| Leak rate | ___ | ___ |
| Error counts | ___ | ___ |
| System prompt SHA-256 | ___ | ___ |

## What I changed in the system prompt

___

## Limitations

- n=20; this is not statistically generalizable.
- One model and one run per condition.
- One manual labeler; no inter-rater reliability.
- Temperature > 0, so replies are not guaranteed to repeat.
