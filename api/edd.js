export default async function handler(req, res) {
  const { pincode } = req.query;

  const ORIGIN_PIN = "673571";
  const API_KEY = process.env.DELHIVERY_API_KEY;

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

    // 👇 SEND FULL RESPONSE TO BROWSER
    res.status(200).json({
      pickupDate,
      delhivery_response: data
    });

  } catch (error) {
    res.status(500).json({ error: "API failed" });
  }
}
