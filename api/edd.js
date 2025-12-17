export default async function handler(req, res) {
  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: "Destination pincode required" });
  }

  const ORIGIN_PIN = "673571"; // your pickup pincode
  const API_KEY = process.env.DELHIVERY_API_KEY;

  try {
    // 1️⃣ Call Delhivery Expected TAT API
    const url =
      `https://track.delhivery.com/api/dc/expected_tat` +
      `?origin_pin=${ORIGIN_PIN}` +
      `&destination_pin=${pincode}` +
      `&mot=S`;

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

    // 2️⃣ Dispatch date logic (6 PM cutoff)
    const now = new Date();
    const dispatchDate = new Date(now);

    if (now.getHours() >= 18) {
      dispatchDate.setDate(dispatchDate.getDate() + 1);
    }

    // 3️⃣ Delivery date = dispatch date + TAT days
    const deliveryDate = new Date(dispatchDate);
    deliveryDate.setDate(deliveryDate.getDate() + tatDays);

    // 4️⃣ Final response
    return res.status(200).json({
      tat_days: tatDays,
      dispatch_date: dispatchDate.toDateString(),
      delivery_date: deliveryDate.toDateString()
    });

  } catch (error) {
    return res.status(500).json({
      error: "Delhivery Expected TAT API failed"
    });
  }
}
