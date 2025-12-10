import Link from "next/link";
import SwaggerUi from "swagger-ui-react";
import { _DEFAULT_APP_NAME } from "@/constants";
import "swagger-ui-react/swagger-ui.css";

function ApiDoc() {
  return (
    <div className='container mx-auto p-4'>
      <Link className='mb-4 font-bold text-2xl' href='/'>
        {_DEFAULT_APP_NAME}
      </Link>
      <div className='swagger-ui-wrapper rounded-lg bg-white shadow-sm'>
        <SwaggerUi url='/api/docs' />
      </div>
    </div>
  );
}

export default ApiDoc;
