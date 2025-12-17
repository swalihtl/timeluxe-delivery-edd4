export default async function handler(req, res) {
  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: "Destination pincode required" });
  }

  const ORIGIN_PIN = "673571"; // your pickup pincode
  const API_KEY = process.env.DELHIVERY_API_KEY;

  const url =
    `https://track.delhivery.com/api/dc/expected_tat` +
    `?origin_pin=${ORIGIN_PIN}` +
    `&destination_pin=${pincode}` +
    `&mot=S`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Token ${API_KEY}`
      }
    });

    const data = await response.json();

    // Extract expected delivery date safely
    const expectedDate =
      data?.data?.[0]?.expected_delivery_date ||
      data?.data?.expected_delivery_date;

    if (!expectedDate) {
      return res.status(404).json({
        error: "Expected delivery date not available",
        raw: data
      });
    }

    res.status(200).json({
      delivery_date: expectedDate
    });
  } catch (error) {
    res.status(500).json({
      error: "Delhivery Expected TAT API failed"
    });
  }
}
