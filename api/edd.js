export default async function handler(req, res) {
  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: "Pincode required" });
  }

  const ORIGIN_PIN = "673571"; // your pickup pincode
  const API_KEY = process.env.DELHIVERY_API_KEY;

  // Pickup date = today (YYYY-MM-DD)
  const today = new Date();
  if (today.getHours() >= 18) {
    today.setDate(today.getDate() + 1);
  }

  const pickupDate = today.toISOString().split("T")[0];

  const url =
    `https://express-dev-test.delhivery.com/api/dc/expected_tat` +
    `?origin_pin=${ORIGIN_PIN}` +
    `&destination_pin=${pincode}` +
    `&mot=S` +
    `&pdt=B2C` +
    `&expected_pickup_date=${pickupDate}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${API_KEY}`
      }
    });

    const data = await response.json();

    const tatDate =
      data?.data?.[0]?.expected_delivery_date ||
      data?.data?.[0]?.edd;

    if (!tatDate) {
      return res.status(404).json({ error: "TAT not available" });
    }

    res.status(200).json({
      delivery_date: tatDate
    });
  } catch (error) {
    res.status(500).json({ error: "Delhivery TAT API error" });
  }
}
