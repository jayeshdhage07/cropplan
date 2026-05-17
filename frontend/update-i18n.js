const fs = require('fs');
const path = require('path');

const locales = ['en', 'hi', 'mr'];
const i18nDir = path.join(__dirname, 'public', 'i18n');

// Keys to add (English defaults)
const newKeys = {
  ALERTS: {
    HEADER: "Farming Alerts & Tips",
    NEW_COUNT: "{{count}} New Alerts",
    WARNING_TITLE: "Heavy Rain Warning",
    WARNING_DESC: "Secure onion harvest in Nashik; rains expected within 12h.",
    SPIKE_TITLE: "Market Price Spike",
    SPIKE_DESC: "Wheat modal prices spiked by ₹120/quintal in Solapur.",
    INFO_TITLE: "Farming Advisory",
    INFO_DESC: "Ideal time to sow Rabi crops. Check profit insights."
  },
  DASHBOARD: {
    WEATHER_COND: "Sunny & Warm",
    WEATHER_DESC: "Perfect humidity for sowing seeds",
    METRIC_HUMIDITY: "Humidity",
    METRIC_WIND: "Wind",
    METRIC_RAIN_PROB: "Rain Prob.",
    ADVISORY_TITLE: "Weekly Farming Advisory",
    ADVISORY_SUBTITLE: "Expert recommendations for {{district}} region",
    ADV_ROTATION_TITLE: "Crop Rotation:",
    ADV_ROTATION_DESC: "Consider sowing pulses or legumes after rice harvest to restore nitrogen levels naturally and cut fertilizer costs by 20%.",
    ADV_DRIP_TITLE: "Drip Irrigation:",
    ADV_DRIP_DESC: "For onion crops in Pune, utilize drip systems between 6 AM and 9 AM to reduce water wastage and boost yield size.",
    ADV_PEST_TITLE: "Organic Pest Control:",
    ADV_PEST_DESC: "Spray neem-oil mix (10ml per litre of water) to protect young tomato leaves from thrips and whiteflies safely.",
    WATER_NEED: "Water Need",
    AVAILABLE_COUNT: "{{count}} Available"
  },
  CROPS: {
    LOADING_CROPS: "Loading market crops...",
    DETAIL: {
      MANDI_RATES: "Live Mandi Rates",
      LOADING_PRICES: "Loading mandi prices...",
      TABLE_MANDI: "Mandi",
      TABLE_DISTRICT: "District",
      TABLE_MIN_MAX: "Min / Max Price",
      TABLE_MODAL: "Modal Rate",
      NO_MANDI_DATA: "No active Mandi rate listings found for this crop in the selected district.",
      FETCHING_DETAILS: "Fetching crop details..."
    }
  },
  NAV: {
    CORE_FARMING: "Core Farming",
    ACCOUNT_SETTINGS: "Account & Settings"
  }
};

// Simple Hindi translations
const hiKeys = {
  ALERTS: {
    HEADER: "कृषि अलर्ट और सुझाव",
    NEW_COUNT: "{{count}} नए अलर्ट",
    WARNING_TITLE: "भारी बारिश की चेतावनी",
    WARNING_DESC: "नासिक में प्याज की फसल सुरक्षित करें; 12 घंटे में बारिश की उम्मीद है।",
    SPIKE_TITLE: "बाजार मूल्य में उछाल",
    SPIKE_DESC: "सोलापुर में गेहूं की मॉडल कीमतों में ₹120/क्विंटल का उछाल।",
    INFO_TITLE: "कृषि सलाह",
    INFO_DESC: "रबी फसल बोने का सही समय। लाभ की जानकारी देखें।"
  },
  DASHBOARD: {
    WEATHER_COND: "धूप और गर्मी",
    WEATHER_DESC: "बीज बोने के लिए उत्तम आर्द्रता",
    METRIC_HUMIDITY: "नमी",
    METRIC_WIND: "हवा",
    METRIC_RAIN_PROB: "बारिश की संभावना",
    ADVISORY_TITLE: "साप्ताहिक कृषि सलाह",
    ADVISORY_SUBTITLE: "{{district}} क्षेत्र के लिए विशेषज्ञ सिफारिशें",
    ADV_ROTATION_TITLE: "फसल चक्र:",
    ADV_ROTATION_DESC: "चावल की कटाई के बाद दालें बोने पर विचार करें ताकि नाइट्रोजन का स्तर प्राकृतिक रूप से बहाल हो सके।",
    ADV_DRIP_TITLE: "ड्रिप सिंचाई:",
    ADV_DRIP_DESC: "पुणे में प्याज की फसलों के लिए, सुबह 6 से 9 बजे के बीच ड्रिप सिस्टम का उपयोग करें।",
    ADV_PEST_TITLE: "जैविक कीट नियंत्रण:",
    ADV_PEST_DESC: "थ्रिप्स और व्हाइटफ्लाइज से बचाने के लिए नीम-तेल का छिड़काव करें।",
    WATER_NEED: "पानी की जरूरत",
    AVAILABLE_COUNT: "{{count}} उपलब्ध"
  },
  CROPS: {
    LOADING_CROPS: "बाज़ार की फसलें लोड हो रही हैं...",
    DETAIL: {
      MANDI_RATES: "लाइव मंडी दरें",
      LOADING_PRICES: "मंडी की दरें लोड हो रही हैं...",
      TABLE_MANDI: "मंडी",
      TABLE_DISTRICT: "जिला",
      TABLE_MIN_MAX: "न्यूनतम / अधिकतम मूल्य",
      TABLE_MODAL: "मॉडल दर",
      NO_MANDI_DATA: "इस फसल के लिए कोई मंडी दर उपलब्ध नहीं है।",
      FETCHING_DETAILS: "फसल का विवरण प्राप्त किया जा रहा है..."
    }
  },
  NAV: {
    CORE_FARMING: "मुख्य खेती",
    ACCOUNT_SETTINGS: "खाता और सेटिंग्स"
  }
};

// Simple Marathi translations
const mrKeys = {
  ALERTS: {
    HEADER: "शेती अलर्ट आणि टिप्स",
    NEW_COUNT: "{{count}} नवीन अलर्ट",
    WARNING_TITLE: "मुसळधार पावसाचा इशारा",
    WARNING_DESC: "नाशिकमधील कांद्याची कापणी सुरक्षित करा; 12 तासात पावसाची अपेक्षा.",
    SPIKE_TITLE: "बाजारभाव वाढ",
    SPIKE_DESC: "सोलापुरात गव्हाच्या किमतीत ₹120/क्विंटल वाढ.",
    INFO_TITLE: "शेती सल्ला",
    INFO_DESC: "रब्बी पिकांच्या पेरणीसाठी उत्तम वेळ. नफा तपासा."
  },
  DASHBOARD: {
    WEATHER_COND: "कडक ऊन",
    WEATHER_DESC: "पेरणीसाठी योग्य आर्द्रता",
    METRIC_HUMIDITY: "आर्द्रता",
    METRIC_WIND: "वारा",
    METRIC_RAIN_PROB: "पावसाची शक्यता",
    ADVISORY_TITLE: "साप्ताहिक कृषी सल्ला",
    ADVISORY_SUBTITLE: "{{district}} क्षेत्रासाठी तज्ञांच्या शिफारसी",
    ADV_ROTATION_TITLE: "पीक बदल:",
    ADV_ROTATION_DESC: "नायट्रोजनची पातळी वाढवण्यासाठी भात कापणीनंतर डाळी पेरा.",
    ADV_DRIP_TITLE: "ठिबक सिंचन:",
    ADV_DRIP_DESC: "पुण्यात कांदा पिकासाठी सकाळी 6 ते 9 दरम्यान ठिबक वापरा.",
    ADV_PEST_TITLE: "सेंद्रिय कीड नियंत्रण:",
    ADV_PEST_DESC: "टोमॅटोच्या पानांचे रक्षण करण्यासाठी कडुनिंबाच्या तेलाची फवारणी करा.",
    WATER_NEED: "पाण्याची गरज",
    AVAILABLE_COUNT: "{{count}} उपलब्ध"
  },
  CROPS: {
    LOADING_CROPS: "बाजार पिके लोड होत आहेत...",
    DETAIL: {
      MANDI_RATES: "थेट मंडी दर",
      LOADING_PRICES: "मंडी दर लोड होत आहेत...",
      TABLE_MANDI: "मंडी",
      TABLE_DISTRICT: "जिल्हा",
      TABLE_MIN_MAX: "किमान / कमाल किंमत",
      TABLE_MODAL: "मोडल दर",
      NO_MANDI_DATA: "या पिकासाठी निवडलेल्या जिल्ह्यात कोणताही मंडी दर नाही.",
      FETCHING_DETAILS: "पिकाचा तपशील मिळवत आहे..."
    }
  },
  NAV: {
    CORE_FARMING: "मुख्य शेती",
    ACCOUNT_SETTINGS: "खाते आणि सेटिंग्ज"
  }
};

function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

locales.forEach(lang => {
  const filePath = path.join(i18nDir, `${lang}.json`);
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  const mergeKeys = lang === 'en' ? newKeys : lang === 'hi' ? hiKeys : mrKeys;
  mergeDeep(data, mergeKeys);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json`);
});
