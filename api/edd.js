export default async function handler(req, res) {
  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: "Pincode required" });
  }

  const PICKUP_PIN = "673571";
  const API_KEY = process.env.DELHIVERY_API_KEY;

  try {
    const response = await fetch(
      `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&cgm=0&pt=Pre-paid&o_pin=${PICKUP_PIN}&d_pin=${pincode}`,
      {
        headers: {
          Authorization: `Token ${API_KEY}`
        }
      }
    );

    const now = new Date();

    // Dispatch rule: after 6 PM → next day
    if (now.getHours() >= 18) {
      now.setDate(now.getDate() + 1);
    }

    const minDate = new Date(now);
    minDate.setDate(now.getDate() + 3);

    const maxDate = new Date(now);
    maxDate.setDate(now.getDate() + 5);

    res.status(200).json({
      min: minDate.toDateString(),
      max: maxDate.toDateString()
    });
  } catch (err) {
    res.status(500).json({ error: "Delhivery API error" });
  }
}
