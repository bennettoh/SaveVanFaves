/****************************************/
/* google analytics */
/****************************************/
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', GOOGLE_ANALYTICS_ID);

/****************************************/
/* full story */
/****************************************/
window['_fs_debug'] = false;
window['_fs_host'] = 'fullstory.com';
window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
window['_fs_org'] = FULL_STORY_ORG;
window['_fs_namespace'] = FULL_STORY_NAMESPACE;
(function (m, n, e, t, l, o, g, y) {
  if (e in m) {
    if (m.console && m.console.log) {
      m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');
    }
    return;
  }
  g = m[e] = function (a, b, s) {
    g.q ? g.q.push([a, b, s]) : g._api(a, b, s);
  };
  g.q = [];
  o = n.createElement(t);
  o.async = 1;
  o.crossOrigin = 'anonymous';
  o.src = 'https://' + _fs_script;
  y = n.getElementsByTagName(t)[0];
  y.parentNode.insertBefore(o, y);
  g.identify = function (i, v, s) {
    g(l, { uid: i }, s);
    if (v) g(l, v, s);
  };
  g.setUserVars = function (v, s) {
    g(l, v, s);
  };
  g.event = function (i, v, s) {
    g('event', { n: i, p: v }, s);
  };
  g.anonymize = function () {
    g.identify(!!0);
  };
  g.shutdown = function () {
    g('rec', !1);
  };
  g.restart = function () {
    g('rec', !0);
  };
  g.log = function (a, b) {
    g('log', [a, b]);
  };
  g.consent = function (a) {
    g('consent', !arguments.length || a);
  };
  g.identifyAccount = function (i, v) {
    o = 'account';
    v = v || {};
    v.acctId = i;
    g(o, v);
  };
  g.clearUserCookie = function () { };
  g._w = {};
  y = 'XMLHttpRequest';
  g._w[y] = m[y];
  y = 'fetch';
  g._w[y] = m[y];
  if (m[y])
    m[y] = function () {
      return g._w[y].apply(this, arguments);
    };
  g._v = '1.2.0';
})(window, document, window['_fs_namespace'], 'script', 'user');

/****************************************/
/* site scripts */
/****************************************/
var SHEET = [];
var JSON_URL = `https://spreadsheets.google.com/feeds/cells/${SPREADSHEET_ID}/1/public/full?alt=json`;

const showTellMeMore = () => {
  var x = document.getElementById('tell_me_more');
  var y = document.getElementById('tell_me_more_header');
  if (x.style.display === 'none') {
    x.style.display = 'block';
    y.innerHTML = '<h3>Tell Me More</h3>';
  } else {
    x.style.display = 'none';
  }
};

const showFullDescription = row_number => {
  document.getElementById(`business_${row_number}_long_description`).style.display = 'block';
  document.getElementById(`business_${row_number}_description`).style.display = 'none';
};

const showShortenedDescription = row_number => {
  document.getElementById(`business_${row_number}_long_description`).style.display = 'none';
  document.getElementById(`business_${row_number}_description`).style.display = 'block';
};

const sendGAEvent = (send, type, event_category, event_action, event_label, event_value) => {
  if (type == 'event') {
    gtag('event', event_action, {
      event_category: event_category,
      event_label: event_label,
      value: event_value,
    });
  }
};
var businesses;
var number_of_businesses;
const parseSheetResult = result => {
  let colMap = {
    '1': 'business_name',
    '2': 'webaddress',
    '3': 'location',
    '4': 'description',
    '5': 'social_media',
    '6': 'image_url',
    '7': 'neighbourhood',
  };
  var rows = [];
  result.feed.entry.map(e => {
    let rowNum = parseInt(e['gs$cell'].row, 10);
    while (rows.length < rowNum) {
      rows.push({});
    }
    let rowIndex = rowNum - 1;
    let colNum = e['gs$cell'].col;
    let key = colMap[colNum];
    let cellValue = e['gs$cell']['$t'];
    rows[rowIndex][key] = cellValue;
  });
  businesses = rows;
  number_of_businesses = rows.length;
  return rows;
};

const drawTable = sheet => {
  let t = document.getElementById('sheet');
  t.innerHTML = '';

  sheet
    .filter(row => row.business_name != 'Business Name' && !!row.business_name)
    .sort((a, b) => {
      if (a.business_name.toLowerCase() < b.business_name.toLowerCase()) {
        return -1;
      }
      if (a.business_name.toLowerCase() > b.business_name.toLowerCase()) {
        return 1;
      }
      return 0;
    })
    .map((row, i) => {
      let outer = document.createElement('div');
      outer.className = `place_pill`;
      ['business_name', 'location', 'webaddress', 'description', 'social_media', 'image_url', 'neighbourhood'].map(k => {
        let div = document.createElement('div');
        div.className = `div_content_${k}`;
        div.id = `business_${i}_${k}`;

        if (k == 'webaddress') {
          div.innerHTML +=
            "<br /><img id='preview' src='" +
            row['image_url'] +
            "' width='100%' style='object-fit:cover'>";
          let support_username = (row[k] || '').replace(/[@\s]/g, '');

          let support_link = row[k];
          div.innerHTML +=
            "<div class='support_pill'><a target='_blank' href='" +
            support_link +
            '\' onClick=\'sendGAEvent("send", "event", "support Buttons", "Clicked individual business", "' +
            support_username +
            '", "' +
            i +
            "\");'>Support us" +
            '</a></div>';

        } else if (k == 'business_name') {
          div.textContent = row[k];
        } else if (k == 'location') {
          div.textContent = row[k];
          let support_username = (row['social_media'] || '').replace(/[@\s]/g, '');
          div.innerHTML += "<br /><a href='https://instagram.com/" + support_username + "/' target='_blank'> " + row['social_media'] + " </a>";
        } else if (k == 'description') {
          let long_description_div = document.createElement('div');
          long_description_div.classname = `div_content_${k}`;
          long_description_div.id = `business_${i}_long_description`;

          var description = row[k];
          div.innerHTML = description;
          // div.innerHTML = "<img src='" + description + "'>";

          // var shortened_description = description.substring(0, 120);
          // if (description.length > 120) {
          //   shortened_description =
          //     shortened_description +
          //     `... <a href='' onClick='showFullDescription(${i}); sendGAEvent("send", "event", "businesses", "Clicked see more", "0", "0"); return false;'> show more</a>`;
          //   description =
          //     description +
          //     ` <a href='' onClick='showShortenedDescription(${i}); return false;'> show less</a>`;
          // }
          // div.innerHTML = shortened_description;

          // long_description_div.innerHTML = description;
          // long_description_div.style.display = 'none';
          // outer.appendChild(long_description_div);
        }

        outer.appendChild(div);
        t.appendChild(outer);
      });
    });
};

const searchFilter = () => {
  const searchInput = document.getElementById('search');
  const q = (searchInput.value || '').trim();
  if (q == '') {
    drawTable(SHEET);
    return true;
  }
  const terms = q.split(/\s/).map(w => w.trim().toLowerCase());
  const results = SHEET.filter(row => {
    let words = row.business_name.split(/\s/).map(w => w.trim().toLowerCase());
    // every term must match the head of some word in the business name
    return terms.every(t => words.some(w => w.indexOf(t) == 0));
  });
  drawTable(results);
  return true;
};

const neighbourhoodFilter = () => {
  var neighbourhoodElement = document.getElementById('neighbourhood');
  if (neighbourhoodElement.value == 'All') {
    drawTable(SHEET);
    return true;
  }
  const results = SHEET.filter(row => row.neighbourhood == neighbourhoodElement.value);
  drawTable(results);
  return true;
}

const onBodyLoad = () => {
  $.ajax(JSON_URL).done(function (result) {
    SHEET = parseSheetResult(result);
    drawTable(SHEET);
  });
};

    // const randomlyChooseBusiness = () => {
    //   var random_business_index = Math.floor((Math.random() * number_of_businesses) + 1);
    //   document.getElementById("search").value = businesses[random_business_index]['business_name'];
    //   searchFilter();
    // }