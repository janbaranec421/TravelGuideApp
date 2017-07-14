class Converter {

    static MercatorProjection(latitude: number, longitude: number): { x: number, y: number } {
        var radius = 6378137;
        var max = 85.0511287798;
        var radians = Math.PI / 180;
        var point = { x: 0, y: 0 };

        point.x = radius * longitude * radians;
        point.y = Math.max(Math.min(max, latitude), -max) * radians;
        point.y = radius * Math.log(Math.tan((Math.PI / 4) + (point.y / 2)));

        return point;
    }

    static ReverseMercatorProjection(x: number, y: number): { latitude: number, longitude: number } {
        var r_major = 6378137.0;
        var r_minor = 6356752.314245179;

        var lon = Converter.rad2deg((x / r_major));

        var temp = r_minor / r_major;
        var e = Math.sqrt(1.0 - (temp * temp));
        var lat = Converter.rad2deg(Converter.pj_phi2(Math.exp(0 - (y / r_major)), e));

        return { latitude: lat, longitude: lon };
    }

    static pj_phi2(ts: number, e: number) {
        var N_ITER = 15;
        var HALFPI = Math.PI / 2;

        var TOL = 0.0000000001;
        var Phi, con, dphi;
        var i;
        var eccnth = .5 * e;
        Phi = HALFPI - 2. * Math.atan(ts);
        i = N_ITER;
        do {
            con = e * Math.sin(Phi);
            dphi = HALFPI - 2. * Math.atan(ts * Math.pow((1. - con) / (1. + con), eccnth)) - Phi;
            Phi += dphi;

        }
        while (Math.abs(dphi) > TOL && --i);
        return Phi;
    }

    static deg2rad(d: number) {
        var r = d * (Math.PI / 180.0);
        return r;
    }

    static rad2deg(r: number) {
        var d = r / (Math.PI / 180.0);
        return d;
    }

    static long2tileX(lon: number, zoom: number): number {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }

    static lat2tileY(lat: number, zoom: number): number {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    }

    static Xtile2long(x: number, zoom: number): number {
        return (x / Math.pow(2, zoom) * 360 - 180);
    }

    static Ytile2lat(y: number, zoom: number): number {
        var n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    static tile2boundingBox(x: number, y: number, zoom: number): { xMin: number, xMax: number, yMin: number, yMax: number } {
        var bounds = { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
        bounds.yMin = Converter.Ytile2lat(y + 1, zoom);
        bounds.yMax = Converter.Ytile2lat(y, zoom);
        bounds.xMin = Converter.Xtile2long(x, zoom);
        bounds.xMax = Converter.Xtile2long(x + 1, zoom);
        return bounds;
    }

    static decodePolyline(str: string, precision: number) {
        var index = 0,
            lat = 0,
            lng = 0,
            coordinates = [],
            shift = 0,
            result = 0,
            byte = null,
            latitude_change,
            longitude_change,
            factor = Math.pow(10, precision || 6);

        // Coordinates have variable length when encoded, so just keep
        // track of whether we've hit the end of the string. In each
        // loop iteration, a single coordinate is decoded.
        while (index < str.length) {

            // Reset shift, result, and byte
            byte = null;
            shift = 0;
            result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            shift = result = 0;

            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            lat += latitude_change;
            lng += longitude_change;

            coordinates.push([lat / factor, lng / factor]);
        }
        return coordinates;
    }

    static kelvinToCelsius(kelvin: number): number {
        return kelvin - 273.15;
    }

    static kelvinToFarenheit(kelvin: number): number {
        return kelvin * (9/5) - 459.67
    }

    static farenheitToCelsius(farenheit: number): number {
        return (farenheit - 32) / 1.8;
    }

    static farenheitToKelvin(farenheit: number): number {
        return (farenheit + 459.67) * 5 / 9;
    }

    static celsiusToFarenheit(celsius: number): number {
        return celsius * (9/5) + 32;
    }

    static celsiusToKelvin(celsius: number): number {
        return celsius + 273.15;
    }

    static unixToDateTime(UNIX_timestamp): string {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = (a.getHours() >= 0 && a.getHours() <= 9) ? "0" + a.getHours().toString() : a.getHours().toString();
        var min = (a.getMinutes() >= 0 && a.getMinutes() <= 9) ? "0" + a.getMinutes().toString() : a.getMinutes().toString();
        var sec = (a.getSeconds() >= 0 && a.getSeconds() <= 9) ? "0" + a.getSeconds().toString() : a.getSeconds().toString();
        return date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    }

    static unixToDate(UNIX_timestamp): string {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        return date + ' ' + month + ' ' + year;
    }

    static date_YYYYMMDDHHMM_to_HHMMDDMMYYYY(date: string) {
        var monthsByWord = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var monthsByNumber = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        var year = date.substr(0, 4);
        var month = date.substr(5, 2);
        var day = date.substr(8, 2);
        var hoursMinutes = date.charAt(11) == "0" ? date.substr(12) : date.substr(11);
        for (var i = 1; i <= monthsByWord.length; i++) {
            if (month == monthsByNumber[i]) {
                month = monthsByWord[i];
                break;
            }
        }
        return hoursMinutes + "  &nbsp-&nbsp  " + day + " " + month + " " + year;
    }
}