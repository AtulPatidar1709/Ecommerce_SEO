import User from "../modules/User_Schema.js";
/**
 * Awards loyalty points to a user based on their purchase total.
 * Example: 1 point per $10 spent.
 *
 * @param {String} userId - The ID of the user receiving points
 * @param {Number} totalAmount - The total purchase amount
 * @returns {Promise<void>}
 */
export async function awardPoints(userId, totalAmount) {
  // Define your points logic
  const pointsPerDollar = 0.1; // 1 point per $10
  const points = Math.floor(totalAmount * pointsPerDollar);

  if (points <= 0) return;

  await User.findByIdAndUpdate(userId, {
    $inc: { loyaltyPoints: points },
  });

  console.log(`Awarded ${points} points to user ${userId}`);
}
