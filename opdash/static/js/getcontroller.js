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
                    "x-auth-token": "AACtrsc-0xcqo1bSf8g9Pkh-ILA5VdVwKfKtZ1kuofoZZfAclmH9r9zA3fbOJZvyQD9skrCyjEeuC-bRirD2BLpbFXvKO_yKXqsz-8b1qSorRB2EjV2dRqnuWnBVsdEmSY4znrFaDDn7Xwi-DjhfqWog1ZUUmUM9dtRItk-2gCIpcUoM-p8AHHljCkEjEl3yLWREcxzz25WwvjFaPAgcoGQx7fO7DlLQcRkHC5yP7aGIA5ghfip4YJBT",
                    "x-tenant-id": "1018602",
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
