import express from "express";
import moment from "moment";

import Zone from "./../controllers/zone";
import Placement from "./../controllers/placement";
import Campaign from "./../controllers/campaign";
import CampaignAssignment from "./../controllers/campaignAssignment";
import AdItem from "./../controllers/adItem";
import Report from "./../controllers/report";

const router = express.Router();

// Provides ads to publishers
router.get("/adserve", async(req, res) => {
  try {
//    const type = req.query.type;
    const type = "json";
    const serial = parseInt(req.query.serial);
    const input_index = parseInt(req.query.input_index);  // likely always one
    const stream_index = parseInt(req.query.stream_index);
    // TODO: duration
    
    const zone = await Zone.retrieve({ "serial": serial, "input_index": input_index, "stream_index": stream_index });
    if (!zone) {
      return res.status(204).send("No Zone Found");
    }
    const zoneID = zone.id;
    
    const placements = await Placement.list({ "zone.id": zone.id });
    if (!placements.length) {
      return res.status(204).send("No Placements Found");
    }

    // Usually each Placement have own their priorities
    // and get the most eligible placement for publisher's zone
    // but in this tutorial I didn't include kind of options
    // get random one instead
    const placement = placements[Math.floor(Math.random() * placements.length)];
    const placementID = placement.id;

    const campaign = await Campaign.retrieve({ id: placement.advertisement.id });
    if (!campaign) {
      return res.status(204).send("No Campaign Found");
    }
    const campaignID = campaign.id;

    const campaignAssignments = await CampaignAssignment.list({ "campaign.id": campaignID });
    const adItems = [];

    for (let i=0; i<campaignAssignments.length; i+=1) {
      const campaignAssignment = campaignAssignments[i];
      const adItem = await AdItem.retrieve({ id: campaignAssignment.advertisement.id });

      // Push only ad that has same dimension and duration with Zone's
      //if (zone.width === adItem.width && zone.height === adItem.height && zone.duration === adItem.duration) {
        adItems.push(adItem);
      //}
    }

    // Also need to figure out the most eligible one but
    // use Random() instead
    //TODO: check reports for impression count.
    
    const adItem = adItems[Math.floor(Math.random() * adItems.length)];
    const adItemID = adItem.id;
    let response = null;

    // Tracking impressions
    let query = {
      "placement": placementID,
      "zone.id": zoneID,
      "campaign.id": campaignID,
      "ad_item.id": adItemID,
      "date": moment().format("YYYY-MM-DD")
    }
  
    // Checks if Report already exists
    const report = await Report.update(query, {
      $inc: { impressions: 1 }
    });
  
    // Creates one if not exists
    if (!report) {
      query.impressions = 1;
      await Report.create(query);
    }

    // Creates redirect url, like below
    const host = req.protocol + '://' + req.get("host");
    const redirectURL = `${host}/redirect?placement_id=${placementID}&zone_id=${zoneID}&campaign_id=${campaignID}&ad_item_id=${adItemID}`;

    switch(type) {
      case "js": {
        response = '';
        response += 'document.write(\'<div style="display:inline-block;margin:0;padding:0;">\');';
        response += 'document.write(\'';
        response +=   '<a href="' + redirectURL + '" target="' + adItem.html_target + '" rel="nofollow">';
        response +=   '<img src="' + adItem.creative_url + '" border="0" width="' + adItem.width + '" height="' + adItem.height + '">';
        response +=   '</a>';
        response += '\');';
        response += 'document.write(\'</div>\');';

        res.setHeader("Content-Type", "text/plain");
        res.end(response);
        return;
      }
      case "iframe": {
        response = '';
        response += '<a href="' + redirectURL + '" target="' + adItem.html_target + '" rel="nofollow">';
        response += '<img src="' + adItem.creative_url + '" border="0" width="' + adItem.width + '" height="' + adItem.height + '">';
        response += '</a>';

        res.send(response);
        return;
      }
      case "json": {
        response = {
//          width: adItem.width,
//          height: adItem.height,
          duration: adItem.duration,
//          target: adItem.html_target,
//          redirect_url: redirectURL,
//          image_url: adItem.creative_url
          ad_url: adItem.creative_url
        }

        res.send(response);
        return;
      }
    }

    return res.send("Unknown Ad type");
  }catch(error) {
    return res.send(error);
  }
});

// Tracking clicks and Redirects them to redirect_url
router.get("/redirect", async(req, res) => {
  // Requires Placement ID, Zone ID, Campaign ID, Ad Item ID to track clicks
  // then redirect it to Ad Item link
  const placementID = parseInt(req.query.placement_id);
  const zoneID = parseInt(req.query.zone_id);
  const campaignID = parseInt(req.query.campaign_id);
  const adItemID = parseInt(req.query.ad_item_id);

  const adItem = await AdItem.retrieve({ id: adItemID });
  if (!adItem) {
    return res.send("No Ad Item Found");
  }

  // Tracking clicks
  let query = {
    "placement": placementID,
    "zone.id": zoneID,
    "campaign.id": campaignID,
    "ad_item.id": adItemID,
    "date": moment().format("YYYY-MM-DD")
  }

  // Checks if Report already exists
  const report = await Report.update(query, {
    $inc: { clicks: 1 }
  });

  // Creates one if not exists
  if (!report) {
    query.clicks = 1;
    await Report.create(query);
  }

//  return res.redirect(adItem.location);
  return res.redirect("complete");
});

export default router;
