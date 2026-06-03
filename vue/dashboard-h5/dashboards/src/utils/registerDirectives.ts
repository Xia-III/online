import hasPermission from "@/utils/permissions"

export default function registerDirectives(app: any) {
    hasPermission(app)
}