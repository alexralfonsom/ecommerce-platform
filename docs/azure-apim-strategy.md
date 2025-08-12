# Estrategia Azure API Management + Auth0 + .NET

## Arquitectura de Seguridad Recomendada

### Flujo de Autenticación

```mermaid
graph LR
    A[Frontend] --> B[Auth0]
    B --> C[NextAuth.js]
    C --> D[Azure APIM]
    D --> E[.NET Backend]
    
    A2[Headers] --> D2[APIM Policies]
    D2 --> E2[Minimal [Authorize]]
```

## Azure API Management - Configuración

### 1. Políticas de APIM (Recomendadas)

```xml
<policies>
    <inbound>
        <!-- Validación de Subscription Key -->
        <check-header name="Ocp-Apim-Subscription-Key" failed-check-httpcode="401" failed-check-error-message="Subscription key required" />
        
        <!-- Validación de JWT Token -->
        <validate-jwt header-name="Authorization" failed-validation-httpcode="401" failed-validation-error-message="Unauthorized">
            <openid-config url="https://YOUR_AUTH0_DOMAIN/.well-known/openid_configuration" />
            <audiences>
                <audience>YOUR_API_IDENTIFIER</audience>
            </audiences>
            <issuers>
                <issuer>https://YOUR_AUTH0_DOMAIN/</issuer>
            </issuers>
            <required-claims>
                <claim name="sub" match="any" />
                <claim name="email" match="any" />
            </required-claims>
        </validate-jwt>
        
        <!-- Extracción de Claims para Backend -->
        <set-header name="X-User-ID" exists-action="override">
            <value>@(context.Request.Headers.GetValueOrDefault("Authorization","")
                .Replace("Bearer ","")
                .AsJwt()?.Claims.GetValueOrDefault("sub", ""))</value>
        </set-header>
        
        <set-header name="X-User-Email" exists-action="override">
            <value>@(context.Request.Headers.GetValueOrDefault("Authorization","")
                .Replace("Bearer ","")
                .AsJwt()?.Claims.GetValueOrDefault("email", ""))</value>
        </set-header>
        
        <set-header name="X-User-Roles" exists-action="override">
            <value>@{
                var jwt = context.Request.Headers.GetValueOrDefault("Authorization","")
                    .Replace("Bearer ","").AsJwt();
                var roles = jwt?.Claims.GetValueOrDefault("https://yourapp.com/roles", "");
                return roles;
            }</value>
        </set-header>
        
        <!-- Rate Limiting por Usuario -->
        <rate-limit-by-key calls="100" renewal-period="60" 
            counter-key="@(context.Request.Headers.GetValueOrDefault("X-User-ID", "anonymous"))" />
        
        <!-- CORS Policy -->
        <cors allow-credentials="true">
            <allowed-origins>
                <origin>http://localhost:3000</origin>
                <origin>http://localhost:3001</origin>
                <origin>https://yourapp.com</origin>
            </allowed-origins>
            <allowed-methods>
                <method>GET</method>
                <method>POST</method>
                <method>PUT</method>
                <method>DELETE</method>
                <method>PATCH</method>
                <method>OPTIONS</method>
            </allowed-methods>
            <allowed-headers>
                <header>*</header>
            </allowed-headers>
        </cors>
    </inbound>
    
    <backend>
        <forward-request />
    </backend>
    
    <outbound>
        <!-- Logging para Auditoría -->
        <log-to-eventhub logger-id="security-logger">
            @{
                return new JObject(
                    new JProperty("timestamp", DateTime.UtcNow),
                    new JProperty("userId", context.Request.Headers.GetValueOrDefault("X-User-ID", "")),
                    new JProperty("operation", context.Operation.Name),
                    new JProperty("statusCode", context.Response.StatusCode),
                    new JProperty("userAgent", context.Request.Headers.GetValueOrDefault("User-Agent", "")),
                    new JProperty("ipAddress", context.Request.IpAddress)
                ).ToString();
            }
        </log-to-eventhub>
        
        <!-- Security Headers -->
        <set-header name="X-Content-Type-Options" exists-action="override">
            <value>nosniff</value>
        </set-header>
        <set-header name="X-Frame-Options" exists-action="override">
            <value>DENY</value>
        </set-header>
        <set-header name="X-XSS-Protection" exists-action="override">
            <value>1; mode=block</value>
        </set-header>
    </outbound>
    
    <on-error>
        <!-- Error Logging -->
        <log-to-eventhub logger-id="error-logger">
            @{
                return new JObject(
                    new JProperty("timestamp", DateTime.UtcNow),
                    new JProperty("error", context.LastError.Message),
                    new JProperty("operation", context.Operation.Name),
                    new JProperty("userId", context.Request.Headers.GetValueOrDefault("X-User-ID", ""))
                ).ToString();
            }
        </log-to-eventhub>
    </on-error>
</policies>
```

### 2. Variables de Environment para APIM

```bash
# Frontend (.env.local)
NEXT_PUBLIC_APIM_ADMIN_BASE_URL=https://yourapi.azure-api.net/admin
NEXT_PUBLIC_APIM_BUSINESS_BASE_URL=https://yourapi.azure-api.net/business
NEXT_PUBLIC_API_VERSION=v1

# Server-side (Vercel/Azure)
APIM_ADMIN_SUBSCRIPTION_KEY=your-admin-subscription-key
APIM_BUSINESS_SUBSCRIPTION_KEY=your-business-subscription-key

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://yourapi.com
```

## .NET Backend - Configuración Mínima

### ¿[Authorize] en .NET o Solo APIM?

**RECOMENDACIÓN: Ambos (Defensa en Profundidad)**

#### Configuración .NET Recomendada:

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://YOUR_AUTH0_DOMAIN/";
        options.Audience = "YOUR_API_IDENTIFIER";
        
        // IMPORTANTE: Confiar en headers de APIM
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                // Extraer claims adicionales de headers APIM
                var claims = new List<Claim>();
                
                if (context.HttpContext.Request.Headers.TryGetValue("X-User-ID", out var userId))
                    claims.Add(new Claim("userId", userId!));
                    
                if (context.HttpContext.Request.Headers.TryGetValue("X-User-Email", out var email))
                    claims.Add(new Claim("email", email!));
                    
                if (context.HttpContext.Request.Headers.TryGetValue("X-User-Roles", out var roles))
                {
                    foreach (var role in roles.ToString().Split(','))
                        claims.Add(new Claim(ClaimTypes.Role, role.Trim()));
                }
                
                if (context.HttpContext.Request.Headers.TryGetValue("X-Tenant-ID", out var tenantId))
                    claims.Add(new Claim("tenantId", tenantId!));

                // Agregar claims al principal
                var appIdentity = new ClaimsIdentity(claims);
                context.Principal!.AddIdentity(appIdentity);
                
                return Task.CompletedTask;
            }
        };
    });

// Configurar Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy =>
        policy.RequireRole("admin", "super-admin"));
        
    options.AddPolicy("RequireTenant", policy =>
        policy.RequireClaim("tenantId"));
        
    options.AddPolicy("RequireBusiness", policy =>
        policy.RequireRole("business-admin", "tenant-admin"));
});
```

#### Controllers con Autorización Mínima:

```csharp
[Authorize] // Validación básica - APIM ya validó el token
[ApiController]
[Route("api/[controller]")]
public class CatalogosController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCatalogos()
    {
        // El token ya fue validado por APIM
        // Los claims están disponibles en User.Claims
        var userId = User.FindFirst("userId")?.Value;
        var tenantId = User.FindFirst("tenantId")?.Value;
        
        // Lógica de negocio
        return Ok();
    }
    
    [Authorize(Policy = "RequireAdmin")] // Solo para operaciones críticas
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCatalogo(int id)
    {
        // Doble validación para operaciones sensibles
        return Ok();
    }
}
```

## Manejo de Roles y Permisos

### 1. Estrategia de Roles (Auth0)

```javascript
// Auth0 Rule - Agregar roles personalizados
function addRolesToUser(user, context, callback) {
  const namespace = 'https://yourapp.com/';
  
  // Obtener roles del usuario desde metadata o base de datos
  const assignedRoles = user.app_metadata?.roles || [];
  const permissions = user.app_metadata?.permissions || [];
  
  // Agregar al token
  context.idToken[namespace + 'roles'] = assignedRoles;
  context.accessToken[namespace + 'roles'] = assignedRoles;
  context.accessToken[namespace + 'permissions'] = permissions;
  
  // Agregar tenant info si existe
  if (user.app_metadata?.tenantId) {
    context.idToken[namespace + 'tenantId'] = user.app_metadata.tenantId;
    context.accessToken[namespace + 'tenantId'] = user.app_metadata.tenantId;
  }
  
  callback(null, user, context);
}
```

### 2. NextAuth Configuration

```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      domain: process.env.AUTH0_DOMAIN!,
      authorization: {
        params: {
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid profile email',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      
      // Extraer roles del token Auth0
      if (token.accessToken) {
        const decoded = jwt.decode(token.accessToken as string) as any;
        token.roles = decoded?.['https://yourapp.com/roles'] || [];
        token.permissions = decoded?.['https://yourapp.com/permissions'] || [];
        token.tenantId = decoded?.['https://yourapp.com/tenantId'];
      }
      
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.roles = token.roles as string[];
      session.user.permissions = token.permissions as string[];
      session.user.tenantId = token.tenantId as string;
      
      return session;
    },
  },
});
```

## Ventajas de esta Arquitectura

### ✅ Seguridad en Capas
1. **APIM**: Primera línea de defensa (rate limiting, CORS, validation)
2. **JWT Validation**: Validación de tokens Auth0
3. **[Authorize]**: Autorización granular en .NET

### ✅ Performance
- APIM maneja la mayoría de validaciones
- .NET solo valida roles/permisos específicos
- Caching automático en APIM

### ✅ Auditoría Completa
- Logs centralizados en Azure
- Trazabilidad de todas las operaciones
- Headers de contexto para debugging

### ✅ Escalabilidad
- Rate limiting por usuario
- Load balancing automático
- Circuit breaker patterns

## Recomendaciones Finales

1. **Usa AMBOS**: APIM + [Authorize] para máxima seguridad
2. **Headers Contextuales**: Siempre envía user context desde frontend
3. **Minimal [Authorize]**: Solo en endpoints críticos usar políticas específicas
4. **Monitoring**: Implementa logging completo en todas las capas
5. **Environment Separation**: Keys diferentes por ambiente

Esta arquitectura te da:
- **Seguridad robusta** con múltiples capas
- **Performance óptimo** con validación distribuida  
- **Flexibilidad** para cambios futuros
- **Observabilidad** completa de la aplicación