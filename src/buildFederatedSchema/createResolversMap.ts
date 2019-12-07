import {
  GraphQLScalarType,
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLFieldMap,
  GraphQLSchema,
  GraphQLTypeResolver,
  GraphQLAbstractType,
  GraphQLFieldResolver,
  GraphQLIsTypeOfFn
} from "graphql";

export interface ResolversMap<TSource = any, TContext = any> {
  [key: string]:
    | ResolverObject<TSource, TContext>
    | ResolverOptions<TSource, TContext>
    | GraphQLScalarType
    | EnumResolver;
}

export interface ResolverObject<TSource = any, TContext = any> {
  [key: string]: ResolverOptions<TSource, TContext> | GraphQLFieldResolver<TSource, TContext>;
}

export interface EnumResolver {
  [key: string]: string | number;
}

export interface ResolverOptions<TSource = any, TContext = any> {
  fragment?: string;
  resolve?: GraphQLFieldResolver<TSource, TContext>;
  subscribe?: GraphQLFieldResolver<TSource, TContext>;
  __resolveType?: GraphQLTypeResolver<TSource, TContext>;
  __isTypeOf?: GraphQLIsTypeOfFn<TSource, TContext>;
}

export function createResolversMap(schema: GraphQLSchema): ResolversMap {
  const typeMap = schema.getTypeMap();
  return Object.keys(typeMap)
    .filter(typeName => !typeName.includes("__"))
    .reduce<ResolversMap>((resolversMap, typeName) => {
      const type = typeMap[typeName];
      if (type instanceof GraphQLObjectType) {
        resolversMap[typeName] = {
          ...(type.isTypeOf && {
            __isTypeOf: type.isTypeOf,
          }),
          ...generateFieldsResolvers(type.getFields()),
        };
      }
      if (type instanceof GraphQLInterfaceType) {
        resolversMap[typeName] = {
          __resolveType: generateTypeResolver(type, schema),
          ...generateFieldsResolvers(type.getFields()),
        };
      }
      if (type instanceof GraphQLScalarType) {
        resolversMap[typeName] = type;
      }
      if (type instanceof GraphQLEnumType) {
        const enumValues = type.getValues();
        resolversMap[typeName] = enumValues.reduce<EnumResolver>((enumMap, { name, value }) => {
          enumMap[name] = value;
          return enumMap;
        }, {});
      }
      if (type instanceof GraphQLUnionType) {
        resolversMap[typeName] = {
          __resolveType: generateTypeResolver(type, schema),
        };
      }
      return resolversMap;
    }, {});
}

function generateTypeResolver(
  abstractType: GraphQLAbstractType,
  schema: GraphQLSchema,
): GraphQLTypeResolver<any, any> {
  if (abstractType.resolveType) {
    return async (...args) => {
      const detectedType = await abstractType.resolveType!(...args);
      if (detectedType instanceof GraphQLObjectType) {
        return detectedType.name;
      }
      return detectedType;
    };
  }

  const possibleObjectTypes = schema.getPossibleTypes(abstractType);
  return async (source, context, info) => {
    for (const objectType of possibleObjectTypes) {
      if (objectType.isTypeOf && (await objectType.isTypeOf(source, context, info))) {
        return objectType.name;
      }
    }
    return null;
  };
}

function generateFieldsResolvers(fields: GraphQLFieldMap<any, any>): ResolverObject {
  return Object.keys(fields).reduce<ResolverObject>((fieldsMap, fieldName) => {
    const field = fields[fieldName];
    if (field.subscribe) {
      fieldsMap[fieldName] = {
        subscribe: field.subscribe,
        resolve: field.resolve,
      };
    } else if (field.resolve) {
      fieldsMap[fieldName] = field.resolve;
    }
    return fieldsMap;
  }, {});
}