import Publisher from "./controllers/publisher";
import Zone from "./controllers/zone";
import Advertiser from "./controllers/advertiser";
import Campaign from "./controllers/campaign";
import AdItem from "./controllers/adItem";
import CampaignAssignment from "./controllers/campaignAssignment";
import Placement from "./controllers/placement";

export default async() => {
  const publishers = await Publisher.list({ });
  const zones = await Zone.list({ });
  const advertisers = await Advertiser.list({ });
  const campaigns = await Campaign.list({ });
  const adItems = await AdItem.list({ });
  const campaignAssignments = await CampaignAssignment.list({ });
  const placements = await Placement.list({ });

  if (!publishers.length && !zones.length
    && !advertisers.length && !campaigns.length
    && !adItems.length && !campaignAssignments.length
    && !placements.length) {
    const publisher = await Publisher.create({ name: "D2D Publisher" });
    const zone = await Zone.create({
    	name: "MG",
    	publisher: publisher.id,
    	avails: 4,
    	serial: 40009,
    	input_index: 1,
    	stream_index: 1
	});
    const advertiser = await Advertiser.create({ name: "Acme Advertiser" });
    const campaign = await Campaign.create({ name: "Toxic Campaign", advertiser: advertiser.id });
    const adItem = await AdItem.create({
      name: "Xmas 2022 Ad",
      duration: 30,
      creative_url: "https://monitor.d2dtechnologies.com/segment/hls/ad.mp2/index.m3u8"
    });
    const campaignAssignment = await CampaignAssignment.create({
      advertisement: {
        id: adItem.id
      },
      campaign: {
        id: campaign.id
      }
    });
    const placement = await Placement.create({
      zone: {
        id: zone.id
      },
      advertisement: {
        id: campaign.id,
        type: campaign.object
      }
    });
    const zone2 = await Zone.create({
    	name: "GC1",
    	publisher: publisher.id,
    	avails: 4,
    	serial: 40007,
    	input_index: 1,
    	stream_index: 1
	});
    const placement2 = await Placement.create({
        zone: {
          id: zone2.id
        },
        advertisement: {
          id: campaign.id,
          type: campaign.object
        }
      });
    const zone3 = await Zone.create({
    	name: "GC2",
    	publisher: publisher.id,
    	avails: 4,
    	serial: 30220,
    	input_index: 1,
    	stream_index: 1
	});
    const placement3 = await Placement.create({
        zone: {
          id: zone3.id
        },
        advertisement: {
          id: campaign.id,
          type: campaign.object
        }
      });
  }
}
