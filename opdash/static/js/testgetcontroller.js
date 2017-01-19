    var app = angular.module("app", []);
    app.controller("HttpGetController", function ($scope, $http) {
        
        $scope.DataItems = {"Name":"Jason", "Msg":"hello"};
        $scope.RegionList =[];
        $scope.ServerList =[];
        $scope.tenantid="";
        $scope.token="";

        $scope.GetData = function () {
            $http({
                url:'/api/compute/us-instances',
                //url:'/api/compute/instance/IAD/a8ea5dd5-676e-4bba-84a1-857c475039e7',
                //url:'/url:'/api/compute/instance/IAD/a8ea5dd5-676e-4bba-84a1-857c475039e7api/compute/get_server_mappings/GPv1/1',
                method:"GET",
                headers:{
                    "x-auth-token": $scope.token,
                    "x-tenant-id": $scope.tenantid,
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
