import { Tag } from "@govie-ds/react"
import { ConsentStatuses } from "@ogcio/consent"

interface ConsentInfo {
  status: string
  version?: string
}

interface UserInfo {
  isPublicServant: boolean
  preferredLanguage: string
}

interface ConsentStatusCardProps {
  consentInfo: ConsentInfo | null
  userInfo: UserInfo
  className?: string
}

export default function ConsentStatusCard({
  consentInfo,
  userInfo,
}: ConsentStatusCardProps) {
  return (
    <div className='w-full'>
      <div className='flex flex-row gap-1'>
        <div>
          <span className='text-gray-600'>Status: </span>
          <Tag
            text={consentInfo?.status ?? ""}
            type={
              consentInfo?.status === ConsentStatuses.OptedIn
                ? "success"
                : consentInfo?.status === ConsentStatuses.OptedOut
                  ? "error"
                  : "default"
            }
          />
        </div>
        <div>
          <span className='text-gray-600'>User Type: </span>
          <Tag
            text={userInfo.isPublicServant ? "Public Servant" : "Regular User"}
            type={userInfo.isPublicServant ? "success" : "default"}
          />
        </div>
        {consentInfo?.version && (
          <div>
            <span className='text-gray-600'>Version: </span>
            <Tag text={consentInfo.version} type='default' />
          </div>
        )}
      </div>
    </div>
  )
}
