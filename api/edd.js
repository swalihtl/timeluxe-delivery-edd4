export default async function handler(req, res) {
  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: "Destination pincode required" });
  }

  const ORIGIN_PIN = "673571";
  const API_KEY = process.env.DELHIVERY_API_KEY;

  const url =
    `https://track.delhivery.com/api/dc/expected_tat` +
    `?origin_pin=${ORIGIN_PIN}` +
    `&destination_pin=${pincode}` +
    `&mot=S`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Token ${API_KEY}`
      }
    });

    const data = await response.json();

    const tatDays = data?.data?.tat;

    if (!tatDays) {
      return res.status(404).json({
        error: "TAT not available",
        raw: data
      });
    }

    // Dispatch logic (after 6 PM = next day)
    const deliveryDate = new Date();
    if (deliveryDate.getHours() >= 18) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }

    deliveryDate.setDate(deliveryDate.getDate() + tatDays);

    res.status(200).json({
      tat_days: tatDays,
      delivery_date: deliveryDate.toDateString()
    });

  } catch (error) {
    res.status(500).json({
      error: "Delhivery Expected TAT API failed"
    });
  }
}
