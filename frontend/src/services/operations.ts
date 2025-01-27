// Copyright 2020, Verizon Media
// Licensed under the terms of the MIT. See LICENSE file in project root for terms.

import { Operation, UserRole, UserOperationRole, UserFilter, UserGroupOperationRole } from 'src/global_types'
import { backendDataSource as ds } from './data_sources/backend'
import { userGroupOperationRoleFromDto, userOperationRoleFromDto } from './data_sources/converters'

export async function createOperation(name: string): Promise<Operation> {
  let slug = name.toLowerCase().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (slug === "") {
    return (name === ""
      ? Promise.reject(Error("Operation Name must not be empty"))
      : Promise.reject(Error("Operation Name must include letters or numbers"))
    )
  }
  try {
    return await ds.createOperation({ slug, name })
  } catch (err) {
    if (err.message.match(/slug already exists/g)) {
      slug += '-' + Date.now()
      return await ds.createOperation({ slug, name })
    }
    throw err
  }
}

export async function deleteOperation(slug:string): Promise<void> {
  return await ds.deleteOperation({operationSlug: slug})
}

export async function getOperations(): Promise<Array<Operation>> {
  return await ds.listOperations()
}

export async function getOperationsForAdmin(): Promise<Array<Operation>> {
  return await ds.adminListOperations()
}

export async function getOperation(slug: string): Promise<Operation> {
  return await ds.readOperation({ operationSlug: slug })
}

export async function saveOperation(slug: string, i: { name: string  }) {
  return await ds.updateOperation({ operationSlug: slug }, i)
}

export async function getUserPermissions(i: UserFilter & {
  slug: string,
}): Promise<Array<UserOperationRole>> {
  const roles = await ds.listUserPermissions({ operationSlug: i.slug }, { name: i.name })
  return roles.map(userOperationRoleFromDto)
}

export async function getUserGroupPermissions(i: UserFilter & {
  slug: string,
}): Promise<Array<UserGroupOperationRole>> {
  const roles = await ds.listUserGroupPermissions({ operationSlug: i.slug }, { name: i.name })
  return roles.map(userGroupOperationRoleFromDto)
}

export async function setUserPermission(i: { operationSlug: string, userSlug: string, role: UserRole }) {
  await ds.updateUserPermissions(
    { operationSlug: i.operationSlug },
    { userSlug: i.userSlug, role: i.role },
  )
}

export async function setUserGroupPermission(i: { operationSlug: string, userGroupSlug: string, role: UserRole }) {
  await ds.updateUserGroupPermissions(
    { operationSlug: i.operationSlug },
    { userGroupSlug: i.userGroupSlug, role: i.role },
  )
}


export async function setFavorite(slug: string, favorite: boolean) {
  return await ds.setFavorite({ operationSlug: slug }, {favorite: favorite} )
}
