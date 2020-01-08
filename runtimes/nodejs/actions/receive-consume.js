/*
 * Copyright 2017-2018 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 minor change
 */

/*
 This function is bound to a trigger and is initiated when the message arrives
 via OpenWhisk feed connected to Message Hub. Note that many messages can come in
 as a large batch. Example input:
 {
   "messages": [{
     "partition": 0,
     "key": null,
     "offset": 252,
     "topic": "in-topic",
     "value": {
       "events": [{
         "eventType": "update",
         "timestamp": "2011-01-01T11:11:11.111+02",
         "payload": {
           "velocity": 11,
           "type": "taxi",
           "name": "taxi1",
           "location": {
             "latitude": 11.11,
             "longitude": -1.11
           }
         },
         "deviceType": "taxi",
         "orgId": "Org1",
         "deviceId": "taxi1"
       }, {
         ...
       }]
     }
   }, {
     ...
   }]
 }

Expected output (merge all events from multiple 'messages' into one big 'events'):
{
  "events": [{
    "eventType": "update",
    "timestamp": "2011-01-01T11:11:11.111+02",
    "payload": {
      "velocity": 11,
      "type": "taxi",
      "name": "taxi1",
      "location": {
        "latitude": 11.11,
        "longitude": -1.11
      }
    },
    "deviceType": "taxi",
    "orgId": "Org1",
    "deviceId": "taxi1"
  }, {
    ...
  }]
}
**/

function main(params) {
  console.log("DEBUG: Received the following message as input: " + JSON.stringify(params));

  return new Promise(function (resolve, reject) {
    if (!params.messages || !params.messages[0] ||
      !params.messages[0].value || !params.messages[0].value.events) {
      reject("Invalid arguments. Must include 'messages' JSON array with 'value' field");
    }
    var msgs = params.messages;
    var out = [];
    for (var i = 0; i < msgs.length; i++) {
      var msg = msgs[i];
      for (var j = 0; j < msg.value.events.length; j++) {
        out.push(msg.value.events[j]);
      }
    }
    resolve({
      "events": out
    });
  });
}
