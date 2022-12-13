import express from "express";

import AdItem from "./../controllers/adItem";
import CampaignAssignment from "./../controllers/campaignAssignment";

const router = express.Router();

router.post("/aditem/create", async(req, res) => {
  try {
    const campaignID = req.body.campaign_id;
    const name = req.body.name;
    const creativeUrl = req.body.image_url;
//    const size = req.body.size;
    const duration = req.body.duration;

    const adItem = await AdItem.create({
      name: name,
      duration : duration,
      creative_url: creativeUrl
    });

    await CampaignAssignment.create({
      "advertisement.id": adItem.id,
      "campaign.id": campaignID
    });

    return res.send();
  }catch(error) {
    return res.send(error);
  }
});

router.post("/aditem/delete", async(req, res) => {
  try {
    const adItemIDs = req.body.ids;
    
    // Find campaignAssignments related to the ad item and delete it all
    for (let i=0; i<adItemIDs.length; i+=1) {
      const adItemID = adItemIDs[i];

      await CampaignAssignment.delete({ "advertisement.id": adItemID });
      await AdItem.delete({ id: adItemID });
    }

    return res.send();
  }catch(error) {
    return res.send(error);
  }
});

export default router;
