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
            // since only one slot can be booked per day, so accessing the first index
            var reservationObj = data[0];
            me.reservedDates[key] = reservationObj.tennantName;
        }
    }

    function getStatAndEndDateTimeStamp(date) {
        // to get dayStart time and dayEnd time
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
        // creating key, so that the results can be kept on client-side if data requested for same day again
        var key = dayObj.start + ',' + dayObj.end;

        // if the reservation slot is already fetched from backend of that date, then return it.
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
             deferred.reject('Could not verify slot availability');
        }
        // checking the slot booked at any time on that particular selected day
        var URL = BASE_URL + 'reserve/' + dayObj.start +'/' + dayObj.end;
        $http.get(URL, config).success(onSuccess).error(onError);

        return deferred.promise;
    }

    function confirmOrCancelReservation(tenantObj) {
        var deferred = $q.defer();
        var dayObj = getStatAndEndDateTimeStamp(tenantObj.date);

        // creating key, so that the results can be kept on client-side if data requested for same day again
        var key = dayObj.start + ',' + dayObj.end;

        var onSuccess = function (data, status, headers, config) {
            if (data.success) {
                // if making reservation then add the entry on client-side object
                if (tenantObj.reserved) {
                    me.reservedDates[key] = tenantObj.tenantName;
                } else {
                    // if cancelling reservation then delete the entry from client-side object
                    delete me.reservedDates[key];
                }
            }
            deferred.resolve(); 
        };

        var onError = function (data, status, headers, config) {
            deferred.reject(data);
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