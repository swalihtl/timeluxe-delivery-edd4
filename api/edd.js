export default async function handler(req, res) {
  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: "Destination pincode required" });
  }

  const ORIGIN_PIN = "122003"; // use same as your test
  const API_KEY = process.env.DELHIVERY_API_KEY;

  // Pickup date (YYYY-MM-DD)
  const pickupDate = "2024-05-31"; // dev API works best with fixed past date

  const url =
    `https://express-dev-test.delhivery.com/api/dc/expected_tat` +
    `?origin_pin=${ORIGIN_PIN}` +
    `&destination_pin=${pincode}` +
    `&mot=S` +
    `&pdt=B2C` +
    `&expected_pickup_date=${pickupDate}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${API_KEY}`
      }
    });

    const data = await response.json();

    res.status(200).json({
      pickupDate,
      delhivery_response: data
    });
  } catch (error) {
    res.status(500).json({ error: "Delhivery DEV TAT API failed" });
  }
}
