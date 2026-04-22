import {createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { ListResponse } from "@/Types";
import { BACKEND_BASE_URL } from "@/constants";



const options:CreateDataProviderOptions = {
    getList: {
      getEndpoint:({resource}) => resource,

      buildQueryParams : async ({resource,pagination,filters})=>{
        const page=pagination?.currentPage ?? 1;
        const pageSize=pagination?.pageSize ?? 10;

        if (resource === "departments") {
              return {};
                }

        const params:Record<string,string|number>={page,limit:pageSize};

        filters?.forEach(filter=>{
            const field= 'field' in filter ? filter.field : undefined;
            

            const value= String(filter.value);

            if(resource==='subjects'){
              if (field === "departmentId") params.departmentId = value;
              if (field==='name' || field==='code') params.search=value;

            }

            

          

        });

        return params;
      },

      mapResponse: async (response) => {
  const payload: ListResponse = await response.clone().json();
  return payload.data ?? [];
  },

      getTotalCount: async (response) => {
        const payload: ListResponse = await response.clone().json();
        return payload.pagination?.total ?? payload.data?.length ?? 0;
      }
    }
};

const {dataProvider} = createDataProvider(BACKEND_BASE_URL,options);

export {dataProvider};