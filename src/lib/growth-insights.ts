/**
 * Local growth insights generator.
 * Produces structured, actionable insights from WHO percentile data.
 * Dietary suggestions, activity tips, and doctor questions adapt to the
 * child's actual percentile position — not just their age.
 */

import { calculatePercentile, detectPercentileCrossing } from "./percentile";
import { calculateAgeMonths } from "./age-utils";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface GrowthInsightsInput {
  measurements: Array<{
    measured_date: string;
    weight_kg: number | null;
    height_cm: number | null;
    head_circumference_cm: number | null;
  }>;
  dateOfBirth: string;
  gender: string;
}

export interface GrowthInsightsOutput {
  growth_summary: string;
  dietary_suggestions: string;
  activity_tips: string;
  doctor_questions: string;
}

// -----------------------------------------------------------------------
// Percentile context — computed once, used everywhere
// -----------------------------------------------------------------------

interface PercentileContext {
  weightPercentile: number | null;
  heightPercentile: number | null;
  headPercentile: number | null;
  weightCrossing: CrossingInfo | null;
  heightCrossing: CrossingInfo | null;
  headCrossing: CrossingInfo | null;
  ageMonths: number;
  latestWeight: number | null;
  latestHeight: number | null;
  latestHead: number | null;
}

interface CrossingInfo {
  direction: "up" | "down";
  from: number;
  to: number;
}

function buildPercentileContext(
  sorted: GrowthInsightsInput["measurements"],
  dateOfBirth: string,
  gender: string
): PercentileContext {
  const latest = sorted[sorted.length - 1];
  const latestAge = calculateAgeMonths(dateOfBirth, latest.measured_date);

  const wp = latest.weight_kg != null
    ? calculatePercentile(latest.weight_kg, latestAge, gender, "weight")
    : null;
  const hp = latest.height_cm != null
    ? calculatePercentile(latest.height_cm, latestAge, gender, "height")
    : null;
  const hcp = latest.head_circumference_cm != null && latestAge <= 36
    ? calculatePercentile(latest.head_circumference_cm, latestAge, gender, "head")
    : null;

  function getCrossing(metric: "weight" | "height" | "head"): CrossingInfo | null {
    const key = metric === "weight" ? "weight_kg" : metric === "height" ? "height_cm" : "head_circumference_cm";
    const history = sorted
      .filter((m) => m[key] != null)
      .map((m) => ({
        date: m.measured_date,
        percentile: calculatePercentile(
          m[key] as number,
          calculateAgeMonths(dateOfBirth, m.measured_date),
          gender,
          metric
        ),
      }));
    if (history.length < 2) return null;
    const result = detectPercentileCrossing(history);
    if (!result.crossed) return null;
    return { direction: result.direction as "up" | "down", from: result.from, to: result.to };
  }

  return {
    weightPercentile: wp,
    heightPercentile: hp,
    headPercentile: hcp,
    weightCrossing: getCrossing("weight"),
    heightCrossing: getCrossing("height"),
    headCrossing: getCrossing("head"),
    ageMonths: latestAge,
    latestWeight: latest.weight_kg,
    latestHeight: latest.height_cm,
    latestHead: latest.head_circumference_cm,
  };
}

// -----------------------------------------------------------------------
// Growth summary — descriptive text about where the child sits
// -----------------------------------------------------------------------

function describePercentile(percentile: number, metric: string): string {
  if (percentile < 3) {
    return `${metric} is below the 3rd percentile. This may need attention — discuss with your pediatrician.`;
  }
  if (percentile <= 10) {
    return `${metric} is between the 3rd and 10th percentile. On the lower end but may be normal for your child.`;
  }
  if (percentile <= 25) {
    return `${metric} is between the 10th and 25th percentile — within normal range.`;
  }
  if (percentile <= 75) {
    return `${metric} is between the 25th and 75th percentile — right in the healthy middle range.`;
  }
  if (percentile <= 90) {
    return `${metric} is between the 75th and 90th percentile — slightly above average, typically normal.`;
  }
  if (percentile <= 97) {
    return `${metric} is above the 90th percentile — monitor with your pediatrician.`;
  }
  return `${metric} is above the 97th percentile — discuss with your pediatrician.`;
}

function buildGrowthSummary(ctx: PercentileContext): string {
  const parts: string[] = [];

  if (ctx.weightPercentile != null) {
    parts.push(describePercentile(
      ctx.weightPercentile,
      `Weight (${ctx.latestWeight} kg, ${ctx.weightPercentile}th percentile)`
    ));
  }
  if (ctx.heightPercentile != null) {
    const label = ctx.ageMonths < 24 ? "Length" : "Height";
    parts.push(describePercentile(
      ctx.heightPercentile,
      `${label} (${ctx.latestHeight} cm, ${ctx.heightPercentile}th percentile)`
    ));
  }
  if (ctx.headPercentile != null) {
    parts.push(describePercentile(
      ctx.headPercentile,
      `Head circumference (${ctx.latestHead} cm, ${ctx.headPercentile}th percentile)`
    ));
  }

  // Crossing alerts
  for (const [label, crossing] of [
    ["Weight", ctx.weightCrossing],
    [ctx.ageMonths < 24 ? "Length" : "Height", ctx.heightCrossing],
    ["Head circumference", ctx.headCrossing],
  ] as const) {
    if (crossing) {
      const verb = crossing.direction === "down" ? "dropped" : "increased";
      parts.push(
        `${label} has ${verb} significantly (from ${crossing.from}th to ${crossing.to}th percentile). Discuss this trend with your pediatrician.`
      );
    }
  }

  return parts.length > 0
    ? parts.join(" ")
    : "Growth measurements recorded. Add more data points for detailed percentile analysis.";
}

// -----------------------------------------------------------------------
// Dietary suggestions — age-based baseline + percentile-specific advice
// -----------------------------------------------------------------------

function getBaselineDiet(ageMonths: number): string {
  if (ageMonths < 6) {
    return "Exclusive breastfeeding or formula is recommended for the first 6 months. Ensure adequate vitamin D supplementation (400 IU/day).";
  }
  if (ageMonths < 12) {
    return "Continue breastfeeding or formula alongside solid foods. Start with single-ingredient purees (vegetables, fruits, cereals). Introduce iron-rich foods early. Avoid honey, cow's milk as main drink, and choking hazards.";
  }
  if (ageMonths < 24) {
    return "Transition to family foods with appropriate textures. Offer a variety of fruits, vegetables, whole grains, and protein sources. Whole cow's milk can be introduced after 12 months. Continue vitamin D supplementation.";
  }
  if (ageMonths < 36) {
    return "Offer balanced meals with all food groups. Encourage self-feeding and regular meal/snack times. Include calcium-rich foods for bone development.";
  }
  return "Provide balanced meals with fruits, vegetables, whole grains, lean proteins, and dairy. Encourage water as the primary drink.";
}

function getLowWeightDietAdvice(ageMonths: number, percentile: number): string {
  const severity = percentile < 3 ? "significantly underweight" : "on the lower end for weight";

  if (ageMonths < 6) {
    return `Your child is ${severity}. Consider more frequent feedings (every 2-3 hours). If breastfeeding, consult a lactation specialist to ensure adequate milk transfer. If formula-fed, ensure correct preparation and volume. Track wet diapers — at least 6 per day indicates adequate intake.`;
  }
  if (ageMonths < 12) {
    return `Your child is ${severity}. Offer calorie-dense foods: avocado, banana, full-fat yogurt, nut butters (thinly spread). Add olive oil or butter to purees for extra calories. Offer breast milk or formula before solids to maintain milk intake. Feed on demand and don't restrict portions.`;
  }
  if (ageMonths < 24) {
    return `Your child is ${severity}. Focus on calorie-dense, nutrient-rich foods: avocado, eggs, cheese, nut butters, olive oil mixed into foods. Offer full-fat dairy products. Provide 3 meals plus 2-3 snacks daily. Avoid filling up on juice or water before meals.`;
  }
  return `Your child is ${severity}. Prioritize calorie-dense, nutrient-rich foods: eggs, cheese, nut butters, whole-grain breads with toppings, avocado, and healthy fats. Offer structured meals and snacks every 2-3 hours. Add calories naturally — butter on vegetables, cheese on pasta, smoothies with full-fat yogurt.`;
}

function getHighWeightDietAdvice(ageMonths: number, percentile: number): string {
  const severity = percentile > 97 ? "well above average for weight" : "above average for weight";

  if (ageMonths < 12) {
    return `Your child is ${severity}. For formula-fed infants, ensure correct scoop-to-water ratio. Avoid adding cereal to bottles. Follow hunger/fullness cues — don't force-finish bottles. This percentile range is often normal for breastfed infants.`;
  }
  if (ageMonths < 24) {
    return `Your child is ${severity}. Offer whole fruits and vegetables before other foods. Use whole milk (not reduced-fat until after age 2). Avoid juice and sugary snacks. Let your child self-regulate portions — avoid pressuring to eat or using food as reward.`;
  }
  return `Your child is ${severity}. Focus on whole foods: vegetables, fruits, lean proteins, whole grains. Limit juice to 120ml/day and avoid sugary drinks. Use appropriate portion sizes (child's fist = one serving). Eat together as a family and avoid screen time during meals. Encourage active play rather than restricting food.`;
}

function buildDietarySuggestions(ctx: PercentileContext, currentAge: number): string {
  const parts: string[] = [getBaselineDiet(currentAge)];

  if (ctx.weightPercentile != null) {
    if (ctx.weightPercentile <= 10) {
      parts.push(getLowWeightDietAdvice(currentAge, ctx.weightPercentile));
    } else if (ctx.weightPercentile >= 90) {
      parts.push(getHighWeightDietAdvice(currentAge, ctx.weightPercentile));
    }
  }

  // Dropping weight percentile — caloric boost advice
  if (ctx.weightCrossing?.direction === "down") {
    parts.push(
      `Weight percentile has been dropping (from ${ctx.weightCrossing.from}th to ${ctx.weightCrossing.to}th). Increase calorie density of meals — add healthy fats (olive oil, butter, avocado) to foods. Offer more frequent meals and snacks. Track daily intake and discuss with your pediatrician.`
    );
  }

  // Rising weight percentile rapidly
  if (ctx.weightCrossing?.direction === "up" && ctx.weightPercentile != null && ctx.weightPercentile > 85) {
    parts.push(
      `Weight percentile has been climbing rapidly (from ${ctx.weightCrossing.from}th to ${ctx.weightCrossing.to}th). Focus on nutrient-dense foods over calorie-dense ones. Ensure active play time and avoid excessive snacking or sugary drinks.`
    );
  }

  return parts.join(" ");
}

// -----------------------------------------------------------------------
// Activity tips — age-based baseline + percentile-specific advice
// -----------------------------------------------------------------------

function getBaselineActivity(ageMonths: number): string {
  if (ageMonths < 6) {
    return "Provide supervised tummy time several times a day to strengthen neck and shoulder muscles. Encourage reaching for toys. Interact face-to-face during play.";
  }
  if (ageMonths < 12) {
    return "Encourage crawling, pulling to stand, and exploring safe environments. Provide age-appropriate toys that encourage movement. Limit screen time — none recommended under 18 months.";
  }
  if (ageMonths < 24) {
    return "Encourage walking, climbing (supervised), and active play. Provide push/pull toys and balls. Go outside daily for fresh air and exploration.";
  }
  if (ageMonths < 36) {
    return "Aim for at least 3 hours of physical activity daily (running, jumping, dancing, playground play). Outdoor time supports motor development and sleep quality.";
  }
  return "Aim for at least 60 minutes of moderate-to-vigorous physical activity daily. Encourage structured activities (swimming, gymnastics) alongside free play. Limit sedentary screen time to 1 hour/day.";
}

function buildActivityTips(ctx: PercentileContext, currentAge: number): string {
  const parts: string[] = [getBaselineActivity(currentAge)];

  // Low weight — gentle, appetite-stimulating activity
  if (ctx.weightPercentile != null && ctx.weightPercentile <= 10) {
    parts.push(
      "For underweight children, moderate activity helps stimulate appetite. Focus on fun, non-exhausting play. Avoid intense or prolonged exercise that burns excessive calories. Offer a nutritious snack after active play."
    );
  }

  // High weight — encourage more movement
  if (ctx.weightPercentile != null && ctx.weightPercentile >= 90) {
    if (currentAge < 24) {
      parts.push(
        "Encourage active play and movement throughout the day. Reduce time in strollers, high chairs, and car seats when possible. Make movement fun — dance together, chase games, ball play."
      );
    } else {
      parts.push(
        "Increase daily active play to help balance energy intake. Make physical activity fun and social — playground time with friends, family walks, swimming, dancing. Reduce sedentary screen time. Focus on building enjoyment of movement, not on weight or exercise as punishment."
      );
    }
  }

  // Low height — supporting linear growth
  if (ctx.heightPercentile != null && ctx.heightPercentile <= 10) {
    parts.push(
      "Adequate sleep is crucial for linear growth — growth hormone is primarily released during deep sleep. Ensure age-appropriate sleep duration (12-16h for infants, 11-14h for toddlers, 10-13h for preschoolers). Outdoor play and stretching activities support healthy skeletal development."
    );
  }

  return parts.join(" ");
}

// -----------------------------------------------------------------------
// Doctor questions — targeted to actual findings
// -----------------------------------------------------------------------

function buildDoctorQuestions(ctx: PercentileContext): string {
  const questions: string[] = [];

  // Low weight
  if (ctx.weightPercentile != null && ctx.weightPercentile < 3) {
    questions.push(
      "My child's weight is below the 3rd percentile. Should we investigate possible causes such as feeding difficulties, food allergies, or malabsorption?",
      "Would a referral to a pediatric dietitian be helpful?"
    );
  } else if (ctx.weightPercentile != null && ctx.weightPercentile <= 10) {
    questions.push(
      "My child's weight is on the lower end. Is this a concern given our family build, or should we increase caloric intake?"
    );
  }

  // High weight
  if (ctx.weightPercentile != null && ctx.weightPercentile > 97) {
    questions.push(
      "My child's weight is above the 97th percentile. Should we adjust their diet or activity level? Could there be an underlying hormonal or metabolic factor?"
    );
  } else if (ctx.weightPercentile != null && ctx.weightPercentile >= 90) {
    questions.push(
      "My child's weight is above average. Is this appropriate for their build, or should we make dietary changes?"
    );
  }

  // Low height
  if (ctx.heightPercentile != null && ctx.heightPercentile < 3) {
    questions.push(
      "My child's height/length is below the 3rd percentile. Should we assess for growth hormone deficiency or other causes of short stature?"
    );
  } else if (ctx.heightPercentile != null && ctx.heightPercentile <= 10) {
    questions.push(
      "My child's height/length is on the lower end. Is this consistent with parental heights, or should we investigate further?"
    );
  }

  // Head circumference concerns
  if (ctx.headPercentile != null && (ctx.headPercentile < 3 || ctx.headPercentile > 97)) {
    questions.push(
      `My child's head circumference is at the ${ctx.headPercentile}th percentile. Should we monitor this more closely or do any additional assessments?`
    );
  }

  // Crossing alerts
  for (const [label, crossing] of [
    ["weight", ctx.weightCrossing],
    ["height", ctx.heightCrossing],
    ["head circumference", ctx.headCrossing],
  ] as const) {
    if (crossing) {
      questions.push(
        `My child's ${label} percentile has shifted from the ${crossing.from}th to the ${crossing.to}th. Should I be concerned about this trend?`
      );
    }
  }

  // Divergent weight vs height
  if (ctx.weightPercentile != null && ctx.heightPercentile != null) {
    const gap = Math.abs(ctx.weightPercentile - ctx.heightPercentile);
    if (gap > 40) {
      const heavier = ctx.weightPercentile > ctx.heightPercentile;
      questions.push(
        heavier
          ? "My child's weight percentile is much higher than their height percentile. Could this indicate excessive weight gain relative to their frame?"
          : "My child's height percentile is much higher than their weight percentile. Could they need more calories to support their growth?"
      );
    }
  }

  // Default if nothing concerning
  if (questions.length === 0) {
    questions.push(
      "Is my child's growth tracking well for their age?",
      "Are there any nutritional supplements we should consider?"
    );
  }

  return questions.join(" ");
}

// -----------------------------------------------------------------------
// Main generator
// -----------------------------------------------------------------------

export function generateGrowthInsights(input: GrowthInsightsInput): GrowthInsightsOutput {
  const { measurements, dateOfBirth } = input;
  const currentAge = calculateAgeMonths(dateOfBirth, new Date().toISOString().split("T")[0]);

  if (measurements.length === 0) {
    return {
      growth_summary: "No measurements recorded yet. Add growth measurements to receive personalized insights.",
      dietary_suggestions: getBaselineDiet(currentAge),
      activity_tips: getBaselineActivity(currentAge),
      doctor_questions: "Bring up any feeding or development concerns at your next well-child visit.",
    };
  }

  // Sort measurements chronologically
  const sorted = [...measurements].sort(
    (a, b) => new Date(a.measured_date).getTime() - new Date(b.measured_date).getTime()
  );

  const ctx = buildPercentileContext(sorted, dateOfBirth, input.gender);

  return {
    growth_summary: buildGrowthSummary(ctx),
    dietary_suggestions: buildDietarySuggestions(ctx, currentAge),
    activity_tips: buildActivityTips(ctx, currentAge),
    doctor_questions: buildDoctorQuestions(ctx),
  };
}
