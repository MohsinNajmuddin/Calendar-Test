angular.module('calendar.app').factory('utilService', function ($q, $http) {
    
    const BASE_URL = 'http://localhost:3000/';
    
    var me = {
        reservedDates: {}
    };

    function getDateInUnixTimeStamp(date) {
        let unixTimeStamp = parseInt((date.getTime() / 1000).toFixed(0));
        return unixTimeStamp;
    }

    function parseResponse(data) {
        if (data.length) {
            var reservationObj = data[0];
            me.reservedDates[reservationObj.time] = reservationObj.tennantName;
        }
    }

    function isDateReserved(date) {
        var deferred = $q.defer();

        var timeStamp = getDateInUnixTimeStamp(date);
        var tenantObj = {};
        var config = {
            headers : {'Accept' : 'application/json'}
        };

        if (me.reservedDates[timeStamp]) {
            tenantObj = {
                isDateReserved: true,
                tenantName: me.reservedDates[timeStamp]
            };
            deferred.resolve(tenantObj);
            return deferred.promise;
        }

        var onSuccess = function (data, status, headers, config) {
            parseResponse(data.reserved);
            tenantObj = {
                isDateReserved: (!!me.reservedDates[timeStamp]),
                tenantName: me.reservedDates[timeStamp]
            };
            deferred.resolve(tenantObj);
        };

        var onError = function (data, status, headers, config) {
            // incase call failed
            return '';
        }

        var URL = BASE_URL + 'reserve/' + '1583348400' +'/' + '1585594800';
        $http.get(URL, config).success(onSuccess).error(onError);

        return deferred.promise;
    }

    function confirmOrCancelReservation(tenantObj) {
        var deferred = $q.defer();
        var timeStamp = getDateInUnixTimeStamp(tenantObj.date);

        var onSuccess = function (data, status, headers, config) {
            if (data.success) {
                if (tenantObj.reserved) {
                    me.reservedDates[timeStamp] = tenantObj.tenantName;
                } else {
                    delete me.reservedDates[timeStamp];
                }
            }
            deferred.resolve(); 
        };

        var onError = function (data, status, headers, config) {
        }

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