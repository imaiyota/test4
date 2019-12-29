window.onload = function () {

  var projection = new OpenLayers.Projection("EPSG:900913");      // データソース、内部演算はWeb Mercator
  var displayProjection = new OpenLayers.Projection("EPSG:4326"); // 表示はWGS1984(経緯度)

  var googleMaxExtent = new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34);

  // 適当な区画
  var dataMaxExtent = new OpenLayers.Bounds(134.150001, 33.490001, 134.380001, 33.810001)
    .transform(displayProjection, projection);

  var map = new OpenLayers.Map(
    "map", // 地図を表示するdivのID
    { // 地図全般のオプション
      allOverlays: true,
      projection: projection,
      displayProjection: displayProjection,
      units: "m", // 座標単位はメートル
      maxResolution: 156543.0339,
      maxExtent: googleMaxExtent,
      numZoomLevels: 30,
      controls: []
    }
  );
  // 画像パスを計算する関数
  // OpenLayers.Layer.TMSのgetURLメソッドをオーバーライドする
  // MapTilerが生成するソースを参考にしている
  var getTileURL = function (bounds) {
    var res = this.map.getResolution();
    var x = Math.round((bounds.left - googleMaxExtent.left) / (res * this.tileSize.w));
    var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
    var z = this.map.getZoom();

    var mapBounds = this.maxExtent;
    if (mapBounds.intersectsBounds(bounds) && z >= this.mapMinZoom && z <= this.mapMaxZoom ) {
      var imgurl = this.url + this.layername + "/" + z + "/" + x + "/" + y + "." + this.type;
    } else {
      var imgurl = "../common/img/blank.gif";
    }
  


    return imgurl;
  };

  var layer = new OpenLayers.Layer.TMS( // Tile Map Service
    "Tile Map Overlay",  // レイヤ名
    "mapimg/", // 画像のあるURL
    { // TMSオプション
      mapMinZoom:16,
      mapMaxZoom:23,
      maxExtent: dataMaxExtent,
      layername: "landsat",
      type: 'jpg', // 画像形式
      getURL: getTileURL // 画像のパス(URL)を求める関数
    });

  map.addLayers([layer]);
  map.zoomToExtent(dataMaxExtent);

  loadPolygonLayer(map);
  loadPointLayer(map);


  
  if (!map.getCenter()) {
    map.setCenter(new OpenLayers.LonLat(134.36653, 33.60400).transform(displayProjection, projection), 2);
  }


  map.addControl(new OpenLayers.Control.LayerSwitcher());
  map.addControl(new OpenLayers.Control.Navigation());
  map.addControl(new OpenLayers.Control.PanZoomBar());
  map.addControl(new OpenLayers.Control.MousePosition());
  map.addControl(new OpenLayers.Control.KeyboardDefaults());

};



function loadPolygonLayer(map)
{
  var style = new OpenLayers.StyleMap({
    'default': new OpenLayers.Style ({
      strokeColor: "#909090",
      fillColor: "#f0f0f0",
      strokeOpacity: 0.5,
      fillOpacity: 0.9,
    })
  });

  var layer = new OpenLayers.Layer.Vector(
    'Layer of Polygon',
    { styleMap: style }
  );
  map.addLayer(layer);

  var geojson_format = new OpenLayers.Format.GeoJSON({
    externalProjection: new OpenLayers.Projection('EPSG:4326'),
    internalProjection: new OpenLayers.Projection('EPSG:900913')
  });

  loaded_data = geojson_format.read(input_geojson_polygon);
  layer.addFeatures(loaded_data);
  return;
}

function loadPointLayer(map)
{
  var style = new OpenLayers.StyleMap({
    'default': new OpenLayers.Style ({
      graphicName:"circle",
      strokeColor: "#ff0000",
      fillColor: "#ff00ff",
      strokeOpacity: 1.0,
      fillOpacity: 0.5,
      pointRadius: 15 // pixel
    })
  });

  var layer = new OpenLayers.Layer.Vector(
    'Layer of Point',
    { styleMap: style }
  );
  map.addLayer(layer);

  var geojson_format = new OpenLayers.Format.GeoJSON({
    externalProjection: new OpenLayers.Projection('EPSG:4326'),
    internalProjection: new OpenLayers.Projection('EPSG:900913')
  });

  loaded_data = geojson_format.read(input_geojson_point);
  layer.addFeatures(loaded_data);
  return;
}

