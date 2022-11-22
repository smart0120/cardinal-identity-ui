export const RightSidebar = () => {
  return (
    <div className="w-full px-4 py-4">
      <div className="flex min-h-[72px] flex-wrap items-center gap-4 md:py-4 md:px-8 justify-between">
        <div className="cursor-pointer">
          <img src="assets/nukepadlogo.png" className='h-[50px] hidden md:block' />
          <img src="favicon.ico" className='h-[50px] md:hidden' />
        </div>
        <div className="flex-5 flex items-center justify-end gap-6">
        </div>
      </div>
    </div>
  )
}
