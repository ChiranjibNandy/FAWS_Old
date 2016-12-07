    var app = angular.module("app", []);
    app.controller("HttpGetController", function ($scope, $http) {

        $scope.DataItems = {"Name":"Jason", "Msg":"hello"};
        $scope.RegionList =[];
        $scope.ServerList =[];

        $scope.GetData = function () {
            $http({
                url:'/api/compute/us-instances',
                //url:'/api/compute/instance/IAD/a8ea5dd5-676e-4bba-84a1-857c475039e7',
                //url:'/url:'/api/compute/instance/IAD/a8ea5dd5-676e-4bba-84a1-857c475039e7api/compute/get_server_mappings/GPv1/1',
                method:"GET",
                headers:{
                    "x-auth-token": "AAD9rI3-99CqTgMVElxlgzMPbKy9uCodpBuYYm6z_qapF-NYMzqq1DJZa5Wbg320U0fhF-Ece_1wsLiaACahS4a_m67kLH8RXvGu6YPrp14UYtN7iV5eGcqR1T48eL0100O9aavBsVNM3A",
                    "x-tenant-id": "1024814",
                    "Cache-Control": "no-cache"
                }})

            .success(function (data, status, headers, config) {
                $scope.DataItems = data;
                $scope.ServerList= data.iad.servers;
            })
            .error(function (data, status, header, config) {
                $scope.DataItems = data;
            });
        };

    });
