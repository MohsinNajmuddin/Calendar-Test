angular.module('calendar.app').factory('utilService', function ($q, $http) {
    
    const BASE_URL = 'http://localhost:3000/';
    
    var me = {
        reservedDates: {}
    };

    function getDateInUnixTimeStamp(date) {
        let unixTimeStamp = parseInt((date.getTime() / 1000).toFixed(0));
        return unixTimeStamp;
    }

    function parseResponse(data, key) {
        if (data.length) {
            var reservationObj = data[0];
            me.reservedDates[key] = reservationObj.tennantName;
        }
    }

    function getStatAndEndDateTimeStamp(date) {
        date.setHours(0,0,0,0);
        var dayStarttimeStamp = getDateInUnixTimeStamp(date);
        date.setHours(23,59,59,999);
        var dayEndtimeStamp = getDateInUnixTimeStamp(date);

        var dayObj = {
            start: dayStarttimeStamp,
            end: dayEndtimeStamp
        }

        return dayObj;
    }

    function isDateReserved(date) {
        var deferred = $q.defer();
        var dayObj = getStatAndEndDateTimeStamp(date);

        var tenantObj = {};
        var config = {
            headers : {'Accept' : 'application/json'}
        };

        var key = dayObj.start + ',' + dayObj.end;

        if (me.reservedDates[key]) {
            tenantObj = {
                isDateReserved: true,
                tenantName: me.reservedDates[key]
            };
            deferred.resolve(tenantObj);
            return deferred.promise;
        }

        var onSuccess = function (data, status, headers, config) {
            parseResponse(data.reserved, key);
            tenantObj = {
                isDateReserved: (!!me.reservedDates[key]),
                tenantName: me.reservedDates[key]
            };
            deferred.resolve(tenantObj);
        };

        var onError = function (data, status, headers, config) {
            // incase call failed
            return '';
        }

        var URL = BASE_URL + 'reserve/' + dayObj.start +'/' + dayObj.end;
        $http.get(URL, config).success(onSuccess).error(onError);

        return deferred.promise;
    }

    function confirmOrCancelReservation(tenantObj) {
        var deferred = $q.defer();
        var dayObj = getStatAndEndDateTimeStamp(tenantObj.date);

        var key = dayObj.start + ',' + dayObj.end;

        var onSuccess = function (data, status, headers, config) {
            if (data.success) {
                if (tenantObj.reserved) {
                    me.reservedDates[key] = tenantObj.tenantName;
                } else {
                    delete me.reservedDates[key];
                }
            }
            deferred.resolve(); 
        };

        var onError = function (data, status, headers, config) {

        }

        var timeStamp = getDateInUnixTimeStamp(tenantObj.date);

        var postReq = {
            headers : {'Accept' : 'application/json'},
            tennantName: tenantObj.tenantName,
            time: timeStamp,
            reserved: tenantObj.reserved
        };

        var URL = BASE_URL + 'reserve/';
        
        $http.post(URL, postReq)
            .success(onSuccess)
            .error(onError);

        return deferred.promise;
    }

    me.isDateReserved = isDateReserved;
    me.confirmOrCancelReservation = confirmOrCancelReservation;
    return me;


});